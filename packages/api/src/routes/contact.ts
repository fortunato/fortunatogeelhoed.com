import { contactSchema } from '@fg/shared/validation/contact';
import type { Context } from 'hono';
import { describeRoute, resolver } from 'hono-openapi';
import { z } from 'zod';
import { toOpenApiSchema } from '../openapi';

// Contact form submission. Validates with the same Zod schema the browser forms use, so the
// client and server can never disagree on what counts as valid. Validation-only for now: a
// well-formed payload is acknowledged but not yet delivered or stored.

// Response shapes that exist only to document the API — they are contract artifacts, not
// validation rules, so unlike contactSchema they are not shared with the frontend. They mirror
// the handler exactly: a bare `ok` on success, and field-keyed error arrays (the shape of
// `z.flattenError(...).fieldErrors`) on a rejected payload.
const successSchema = z.object({ ok: z.literal(true) });
const errorSchema = z.object({
	errors: z.record(z.string(), z.array(z.string())),
});

const spec = describeRoute({
	tags: ['Contact'],
	summary: 'Submit the contact form',
	description:
		'Validates a contact submission against the same schema the browser forms use. A ' +
		'well-formed payload is acknowledged; it is not yet stored or delivered.',
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
	},
});

async function handler(c: Context): Promise<Response> {
	const payload = await c.req.json().catch(() => null);
	const result = contactSchema.safeParse(payload);
	if (!result.success) {
		return c.json({ errors: z.flattenError(result.error).fieldErrors }, 422);
	}
	return c.json({ ok: true });
}

export const contactRoute = [spec, handler] as const;
