import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Drive the route in isolation with a stubbed service, so this covers the handler's own contract
// — the exact JSON it returns and the full Cache-Control header it sets — independent of the
// availability cache's behaviour (which is covered in the service test).
const { getAvailability } = vi.hoisted(() => ({ getAvailability: vi.fn() }));
vi.mock('../services/availability', () => ({ getAvailability }));

const { availabilityRoute } = await import('./availability');

function app(): Hono {
	const instance = new Hono();
	instance.get('/', ...availabilityRoute);
	return instance;
}

afterEach(() => vi.clearAllMocks());

describe('availability route', () => {
	it('returns the service value as JSON', async () => {
		const value = { available: false, until: 'September' };
		getAvailability.mockResolvedValue(value);

		const res = await app().request('/');

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual(value);
	});

	it('sets the full caching policy header for the badge', async () => {
		getAvailability.mockResolvedValue({ available: true, until: '' });

		const res = await app().request('/');

		// The whole header matters: stale-while-revalidate lets the CDN keep serving while a stale
		// entry refreshes, so asserting only max-age would let a regression drop it silently.
		expect(res.headers.get('Cache-Control')).toBe(
			'public, max-age=60, stale-while-revalidate=300',
		);
	});
});
