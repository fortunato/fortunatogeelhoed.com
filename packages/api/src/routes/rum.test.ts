import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { rumRoute } from './rum';

// With no collector configured in the test env, ingest is a no-op; the route's contract is that
// it always answers 204 with an empty body regardless.
describe('rum route', () => {
	it('always answers 204 with no body', async () => {
		const app = new Hono();
		app.post('/', ...rumRoute);

		const res = await app.request('/', {
			method: 'POST',
			body: JSON.stringify({ events: [] }),
		});
		expect(res.status).toBe(204);
		expect(await res.text()).toBe('');
	});
});
