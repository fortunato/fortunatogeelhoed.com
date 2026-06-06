import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';

// The trust knobs are read at module load, so each scenario re-imports the helper with the env
// it needs (reset + stub + dynamic import), then echoes the resolved address through a real
// request. There is no socket in an in-process request, so the no-trust fallback is 'unknown'.
async function resolve(
	headers: Record<string, string>,
	env: Record<string, string> = {},
): Promise<string> {
	vi.resetModules();
	for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
	const { clientIp } = await import('./client-ip');
	const app = new Hono();
	app.get('/', (c) => c.text(clientIp(c)));
	const res = await app.request('/', { headers });
	return res.text();
}

afterEach(() => vi.unstubAllEnvs());

describe('clientIp', () => {
	it('ignores X-Forwarded-For by default, so a direct client cannot spoof it', async () => {
		expect(await resolve({ 'X-Forwarded-For': '1.2.3.4' })).toBe('unknown');
	});

	it('prefers a configured edge header over everything else', async () => {
		expect(
			await resolve(
				{ 'CF-Connecting-IP': '203.0.113.7', 'X-Forwarded-For': '1.2.3.4' },
				{ CLIENT_IP_HEADER: 'cf-connecting-ip', TRUSTED_PROXY_HOPS: '1' },
			),
		).toBe('203.0.113.7');
	});

	it('takes the proxy-appended entry for one trusted hop, ignoring a client-prepended spoof', async () => {
		expect(
			await resolve({ 'X-Forwarded-For': '9.9.9.9, 1.1.1.1' }, { TRUSTED_PROXY_HOPS: '1' }),
		).toBe('1.1.1.1');
	});

	it('walks back the declared number of hops', async () => {
		expect(
			await resolve({ 'X-Forwarded-For': '1.1.1.1, 10.0.0.1' }, { TRUSTED_PROXY_HOPS: '2' }),
		).toBe('1.1.1.1');
	});

	it('falls back to a shared key when nothing resolves', async () => {
		expect(await resolve({}, { TRUSTED_PROXY_HOPS: '1' })).toBe('unknown');
	});
});
