import { SITE_URL } from '@fg/shared';
import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sameOrigin } from './same-origin';

// The guard decides against a fixed allow-list of hosts we control, so the tests assert the real
// request path: a first-party Origin is admitted, everything else is refused — and crucially a
// forwarded host header can no longer talk its way past it.
const SITE_HOST = new URL(SITE_URL).host;

async function post(headers: Record<string, string>): Promise<number> {
	const app = new Hono();
	app.post('/', sameOrigin, (c) => c.body(null, 204));
	const res = await app.request('/', { method: 'POST', headers });
	return res.status;
}

afterEach(() => {
	vi.unstubAllEnvs();
	vi.resetModules();
});

describe('sameOrigin', () => {
	it('allows an Origin matching the canonical site host', async () => {
		expect(await post({ Origin: `https://${SITE_HOST}` })).toBe(204);
	});

	it('allows a localhost Origin for local development', async () => {
		expect(await post({ Origin: 'http://localhost:3000' })).toBe(204);
	});

	it('rejects a cross-origin request', async () => {
		expect(await post({ Origin: 'https://evil.test' })).toBe(403);
	});

	it('does not trust X-Forwarded-Host: a spoofed forwarded host cannot admit a foreign Origin', async () => {
		// The attacker controls both the Origin and the forwarded host on a direct request; the old
		// header-comparison would have matched these and let them through.
		expect(await post({ Origin: 'https://evil.test', 'X-Forwarded-Host': 'evil.test' })).toBe(
			403,
		);
	});

	it('accepts a same-origin Fetch Metadata signal even without an Origin header', async () => {
		// The browser sets Sec-Fetch-Site and page script cannot forge it, so a reported same-origin
		// fetch is admitted directly, independent of the Origin allow-list.
		expect(await post({ 'Sec-Fetch-Site': 'same-origin' })).toBe(204);
	});

	it('refuses a cross-site Fetch Metadata signal carrying a foreign Origin', async () => {
		expect(await post({ 'Sec-Fetch-Site': 'cross-site', Origin: 'https://evil.test' })).toBe(
			403,
		);
	});

	it('rejects a request with no Origin and no first-party Fetch Metadata', async () => {
		expect(await post({ 'X-Forwarded-Host': SITE_HOST })).toBe(403);
	});

	it('rejects a malformed Origin', async () => {
		expect(await post({ Origin: 'not a url' })).toBe(403);
	});

	it('honours a PUBLIC_HOST deployment override', async () => {
		vi.resetModules();
		vi.stubEnv('PUBLIC_HOST', 'preview.example.com');
		const { sameOrigin: guard } = await import('./same-origin');

		const app = new Hono();
		app.post('/', guard, (c) => c.body(null, 204));
		const ok = await app.request('/', {
			method: 'POST',
			headers: { Origin: 'https://preview.example.com' },
		});
		expect(ok.status).toBe(204);
	});
});
