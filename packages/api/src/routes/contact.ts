import { contactSchema } from '@fg/shared/validation/contact';
import type { Context } from 'hono';
import { describeRoute, resolver } from 'hono-openapi';
import { z } from 'zod';
import { logger } from '../logger';
import { toOpenApiSchema } from '../openapi';
import { sendContactEmail } from '../services/email';

// Contact form submission. Validates with the same Zod schema the browser forms use, so the
// client and server can never disagree on what counts as valid. A well-formed payload is then
// delivered by email; it is not stored. Delivery is fail-closed (see the handler).

// Response shapes that exist only to document the API — they are contract artifacts, not
// validation rules, so unlike contactSchema they are not shared with the frontend. They mirror
// the handler exactly: a bare `ok` on success, and field-keyed error arrays (the shape of
// `z.flattenError(...).fieldErrors`) on a rejected payload.
const successSchema = z.object({ ok: z.literal(true) });
const errorSchema = z.object({
	errors: z.record(z.string(), z.array(z.string())),
});
const deliveryErrorSchema = z.object({ error: z.literal('delivery_failed') });

const spec = describeRoute({
	tags: ['Contact'],
	summary: 'Submit the contact form',
	description:
		'Validates a contact submission against the same schema the browser forms use, then ' +
		'delivers it by email. The submission is not stored.',
	requestBody: {
		required: true,
		content: {
			'application/json': { schema: toOpenApiSchema(contactSchema) },
		},
	},
	responses: {
		200: {
			description: 'Payload accepted.',
			content: { 'application/json': { schema: resolver(successSchema) } },
		},
		403: { description: 'Rejected: cross-site request blocked by CSRF protection.' },
		413: { description: 'Payload exceeds the size limit.' },
		422: {
			description: 'Validation failed; errors are keyed by field name.',
			content: { 'application/json': { schema: resolver(errorSchema) } },
		},
		429: { description: 'Rate limit exceeded.' },
		502: {
			description: 'The submission was valid but could not be delivered upstream.',
			content: { 'application/json': { schema: resolver(deliveryErrorSchema) } },
		},
	},
});

async function handler(c: Context): Promise<Response> {
	const payload = await c.req.json().catch(() => null);

	// Honeypot: `company` is a hidden field no human ever sees or fills. If it arrives non-empty a
	// bot completed it, so acknowledge success (the bot moves on, none the wiser) and drop the
	// submission. The field is intentionally absent from contactSchema — which strips unknown keys —
	// so it never surfaces in the public contract.
	const honeypot = (payload as Record<string, unknown> | null)?.company;
	if (typeof honeypot === 'string' ? honeypot.trim() !== '' : honeypot != null) {
		logger.debug('contact honeypot tripped');
		return c.json({ ok: true });
	}

	const result = contactSchema.safeParse(payload);
	if (!result.success) {
		return c.json({ errors: z.flattenError(result.error).fieldErrors }, 422);
	}

	// Valid payload: deliver it. Fail closed — a provider error or missing configuration returns a
	// 502 so the visitor knows it did not go through and can retry, rather than a false success that
	// would silently lose a real lead. The cause is logged inside the service, never the secrets.
	const sent = await sendContactEmail(result.data);
	if (!sent.ok) {
		return c.json({ error: 'delivery_failed' }, 502);
	}
	return c.json({ ok: true });
}

export const contactRoute = [spec, handler] as const;
