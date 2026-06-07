import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The route modules are tested in isolation elsewhere; this file verifies the *wiring* in
// index.ts — that the shared protection layer (body-size cap, same-origin guard, per-IP rate
// limit) actually sits in front of the JSON endpoints, in the right order. Each test re-imports
// the app so the in-memory rate-limit counters start fresh.
let app: typeof import('./index').app;

// A request that looks first-party: a browser Origin matching the canonical site host, which the
// same-origin guard accepts (and which a proxy mirrors into X-Forwarded-Host).
const FIRST_PARTY = {
	Origin: 'https://fortunatogeelhoed.com',
	'X-Forwarded-Host': 'fortunatogeelhoed.com',
};

beforeEach(async () => {
	vi.resetModules();
	({ app } = await import('./index'));
});

afterEach(() => {
	vi.resetModules();
});

describe('/api/rum wiring', () => {
	it('rejects a request with no Origin (same-origin guard)', async () => {
		const res = await app.request('/api/rum', { method: 'POST', body: '{}' });
		expect(res.status).toBe(403);
	});

	it('rejects a cross-origin request', async () => {
		const res = await app.request('/api/rum', {
			method: 'POST',
			headers: { Origin: 'https://evil.test', 'X-Forwarded-Host': 'fortunatogeelhoed.com' },
			body: '{}',
		});
		expect(res.status).toBe(403);
	});

	it('accepts a first-party request with 204 and no body', async () => {
		const res = await app.request('/api/rum', {
			method: 'POST',
			headers: FIRST_PARTY,
			body: JSON.stringify({ events: [] }),
		});
		expect(res.status).toBe(204);
		expect(await res.text()).toBe('');
	});

	it('rejects an oversized payload before the same-origin guard (413)', async () => {
		// The body cap runs first, so an oversized body is refused even without a valid Origin.
		const res = await app.request('/api/rum', {
			method: 'POST',
			headers: FIRST_PARTY,
			body: 'x'.repeat(65 * 1024),
		});
		expect(res.status).toBe(413);
	});
});

describe('/api/contact wiring', () => {
	it('rejects an oversized payload with 413', async () => {
		const res = await app.request('/api/contact', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ message: 'x'.repeat(17 * 1024) }),
		});
		expect(res.status).toBe(413);
	});

	it('rate-limits a burst of submissions with 429', async () => {
		const valid = {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ name: 'Ada', email: 'ada@example.com', message: 'hello there' }),
		};

		const statuses: number[] = [];
		for (let i = 0; i < 6; i++) {
			statuses.push((await app.request('/api/contact', valid)).status);
		}

		// Five accepted, the sixth limited — proving contactRateLimit guards the wired route.
		expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
		expect(statuses[5]).toBe(429);
	});
});
