import { availabilitySchema } from '@fg/shared/validation/availability';
import type { Context } from 'hono';
import { describeRoute, resolver } from 'hono-openapi';
import { getAvailability } from '../services/availability';

// Live availability for the contact-page badge. Reads a gist Fortunato controls, behind a heavy
// cache so visitor traffic never hits GitHub's rate limit. The handler always returns a valid
// value, so the page can trust the response without special-casing failures.

const spec = describeRoute({
	tags: ['Availability'],
	summary: 'Current availability signal',
	description:
		'Drives the contact-page badge. Always resolves to a valid value, even while the ' +
		'upstream source is unreachable, so the caller never has to special-case failure.',
	responses: {
		200: {
			description: 'The current availability.',
			content: { 'application/json': { schema: resolver(availabilitySchema) } },
		},
		429: { description: 'Rate limit exceeded.' },
	},
});

async function handler(c: Context): Promise<Response> {
	const data = await getAvailability();
	c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
	return c.json(data);
}

export const availabilityRoute = [spec, handler] as const;
