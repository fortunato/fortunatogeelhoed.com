import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { contactRoute } from './contact';

// Drive the route module in isolation (no global middleware), so this covers the handler + its
// validation wiring directly.
async function post(body: unknown): Promise<Response> {
	const app = new Hono();
	app.post('/', ...contactRoute);
	return app.request('/', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
}

describe('contact route', () => {
	it('accepts a well-formed submission', async () => {
		const res = await post({ name: 'Ada', email: 'ada@example.com', message: 'hello' });
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	it('rejects an invalid submission with field-keyed errors', async () => {
		const res = await post({ name: '', email: 'not-an-email', message: '' });
		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(Object.keys(body.errors).sort()).toEqual(['email', 'message', 'name']);
	});

	it('rejects a non-JSON body', async () => {
		const app = new Hono();
		app.post('/', ...contactRoute);
		const res = await app.request('/', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: 'not json',
		});
		expect(res.status).toBe(422);
	});
});
