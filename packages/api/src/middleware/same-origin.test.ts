import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { sameOrigin } from './same-origin';

// A tiny app guarded by the middleware lets us assert its contract through the real request path.
// The expected host is taken from X-Forwarded-Host (set deterministically here, as it would be by
// a proxy in front of the container).
function guarded() {
	const app = new Hono();
	app.post('/', sameOrigin, (c) => c.body(null, 204));
	return app;
}

async function post(headers: Record<string, string>): Promise<number> {
	const res = await guarded().request('/', { method: 'POST', headers });
	return res.status;
}

describe('sameOrigin', () => {
	it('allows a request whose Origin matches the forwarded host', async () => {
		expect(
			await post({ Origin: 'https://example.com', 'X-Forwarded-Host': 'example.com' }),
		).toBe(204);
	});

	it('rejects a cross-origin request', async () => {
		expect(await post({ Origin: 'https://evil.test', 'X-Forwarded-Host': 'example.com' })).toBe(
			403,
		);
	});

	it('rejects a request with no Origin', async () => {
		expect(await post({ 'X-Forwarded-Host': 'example.com' })).toBe(403);
	});

	it('rejects a malformed Origin', async () => {
		expect(await post({ Origin: 'not a url', 'X-Forwarded-Host': 'example.com' })).toBe(403);
	});
});
