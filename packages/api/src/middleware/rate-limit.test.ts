import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { availabilityRateLimit, contactRateLimit, rumRateLimit } from './rate-limit';

// Each limiter is a module-level singleton with its own in-memory store. With no forwarded header
// and no socket, every in-process request resolves to the same key, so a burst lands in one
// bucket and the limit is observable through the real middleware path. The three limiters keep
// separate counters, so exercising one does not affect the others.
function appWith(limiter: typeof contactRateLimit): Hono {
	const app = new Hono();
	app.post('/', limiter, (c) => c.body(null, 200));
	return app;
}

describe('rate limiters', () => {
	it('contact: allows up to 5, then answers 429 with the configured message and policy', async () => {
		const app = appWith(contactRateLimit);

		const responses: Response[] = [];
		for (let i = 0; i < 6; i++) {
			responses.push(await app.request('/', { method: 'POST' }));
		}

		expect(responses.map((r) => r.status)).toEqual([200, 200, 200, 200, 200, 429]);

		const first = responses[0] as Response;
		// The policy header must advertise the actual configured ceiling (5 per 10-minute window),
		// not merely exist — a limiter wired to the wrong number would still send *a* header.
		expect(first.headers.get('ratelimit-policy')).toBe('5;w=600');
		expect(first.headers.get('ratelimit')).toContain('limit=5');

		const limited = responses[5] as Response;
		expect(await limited.json()).toEqual({ error: 'Too many requests, please retry later.' });
	});

	it('availability: advertises the 120-per-minute ceiling and decrements remaining', async () => {
		const app = appWith(availabilityRateLimit);

		const first = await app.request('/', { method: 'POST' });
		const second = await app.request('/', { method: 'POST' });

		expect(first.headers.get('ratelimit-policy')).toBe('120;w=60');
		expect(first.headers.get('ratelimit')).toContain('remaining=119');
		expect(second.headers.get('ratelimit')).toContain('remaining=118');
	});

	it('rum: advertises the 100-per-minute ceiling', async () => {
		const app = appWith(rumRateLimit);

		const res = await app.request('/', { method: 'POST' });

		expect(res.headers.get('ratelimit-policy')).toBe('100;w=60');
		expect(res.headers.get('ratelimit')).toContain('limit=100');
	});
});
