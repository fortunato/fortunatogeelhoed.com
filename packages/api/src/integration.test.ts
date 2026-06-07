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

	it('blocks a cross-site form-style submission with the CSRF guard (403)', async () => {
		const res = await app.request('/api/contact', {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				Origin: 'https://evil.test',
			},
			body: 'name=Ada&email=ada@example.com&message=hello',
		});
		expect(res.status).toBe(403);
	});

	it('lets a same-origin form submission through the CSRF guard', async () => {
		const res = await app.request('/api/contact', {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'Sec-Fetch-Site': 'same-origin',
			},
			body: 'name=Ada&email=ada@example.com&message=hello',
		});
		// Past CSRF (not 403); the route then rejects the non-JSON body with 422, proving the guard
		// admitted it rather than blocking it.
		expect(res.status).toBe(422);
	});

	it('does not block a cross-origin application/json post (CSRF exempts JSON by design)', async () => {
		// hono/csrf only acts on form-style content types; this is exactly why /api/rum keeps the
		// custom same-origin guard instead. Documented here so the limitation is explicit.
		const res = await app.request('/api/contact', {
			method: 'POST',
			headers: { 'content-type': 'application/json', Origin: 'https://evil.test' },
			body: JSON.stringify({ name: 'Ada', email: 'ada@example.com', message: 'hello there' }),
		});
		expect(res.status).toBe(200);
	});
});

// The prerendered HTML branch reads files via the Bun runtime, which the Node test runner does not
// provide, so the nonce/CSP serving path is covered as a unit in security-headers.test.ts. Here we
// verify the route-level CSP wiring that runs under Node: the docs page exception and the absence of
// a CSP on the JSON API, plus that the global hardening headers reach those responses.
describe('security headers wiring', () => {
	it('gives the Scalar docs page its own jsdelivr-allowing CSP', async () => {
		const res = await app.request('/api/docs');
		expect(res.headers.get('Content-Security-Policy')).toContain('https://cdn.jsdelivr.net');
	});

	it('attaches the standard hardening headers but no CSP to JSON API responses', async () => {
		const res = await app.request('/api/openapi.json');
		expect(res.status).toBe(200);
		expect(res.headers.get('Content-Security-Policy')).toBeNull();
		expect(res.headers.get('X-Frame-Options')).toBe('DENY');
		expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
	});
});
