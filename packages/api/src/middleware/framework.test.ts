import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { type AppEnv, frameworkMiddleware } from './framework';

// Resolve the framework the way a request does — the middleware reads the `framework`
// cookie and falls back to react for anything absent or unrecognised. A tiny app that
// echoes the resolved value lets us assert that contract through the real request path.
async function resolveFramework(cookie?: string): Promise<string> {
	const app = new Hono<AppEnv>();
	app.use('*', frameworkMiddleware);
	app.get('/', (c) => c.text(c.get('framework')));
	const res = await app.request(
		'/',
		cookie ? { headers: { Cookie: `framework=${cookie}` } } : undefined,
	);
	return res.text();
}

describe('frameworkMiddleware', () => {
	it('honours a recognised framework cookie', async () => {
		expect(await resolveFramework('vue')).toBe('vue');
		expect(await resolveFramework('angular')).toBe('angular');
		expect(await resolveFramework('react')).toBe('react');
	});

	it('defaults to react when the cookie is absent', async () => {
		expect(await resolveFramework()).toBe('react');
	});

	it('defaults to react when the cookie is unrecognised', async () => {
		expect(await resolveFramework('svelte')).toBe('react');
	});
});
