import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { contactRateLimit } from './rate-limit';

// The contact limiter is the strict one (5 per window). With no forwarded header and no socket,
// every in-process request resolves to the same key, so a burst lands in one bucket and the
// limit is observable through the real middleware path. The limiter is a module-level singleton
// with shared state, so this exercises it in a single burst rather than across separate tests.
describe('contactRateLimit', () => {
	it('allows up to the limit, then answers 429, advertising standard headers', async () => {
		const app = new Hono();
		app.post('/', contactRateLimit, (c) => c.body(null, 200));

		const responses: Response[] = [];
		for (let i = 0; i < 6; i++) {
			responses.push(await app.request('/', { method: 'POST' }));
		}

		expect(responses.map((r) => r.status)).toEqual([200, 200, 200, 200, 200, 429]);
		// Standard RateLimit headers are present from the first request onward.
		const first = responses[0] as Response;
		expect(
			first.headers.get('ratelimit-policy') ?? first.headers.get('ratelimit'),
		).toBeTruthy();
	});
});
