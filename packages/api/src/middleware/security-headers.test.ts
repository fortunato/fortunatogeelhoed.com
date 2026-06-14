import { Hono } from 'hono';
import { afterEach, describe, expect, it } from 'vitest';
import {
	DOCS_CSP,
	generateNonce,
	securityHeaders,
	serveHtml,
	strictCsp,
	withNonce,
} from './security-headers';

describe('generateNonce', () => {
	it('returns a fresh base64 value each call', () => {
		const a = generateNonce();
		const b = generateNonce();
		expect(a).not.toBe(b);
		expect(a).toMatch(/^[A-Za-z0-9+/]+=*$/);
		expect(a.length).toBeGreaterThanOrEqual(16);
	});
});

describe('withNonce', () => {
	it('tags inline scripts but leaves module bundles and JSON seeds untouched', () => {
		const html = [
			'<script>theme()</script>',
			'<script type="module" crossorigin src="/assets/app.js"></script>',
			'<script type="application/json" id="jb-availability">{}</script>',
			'<script>window.__hydration = 1</script>',
		].join('');

		const out = withNonce(html, 'NONCEVAL');

		// Both attribute-less inline scripts get the nonce.
		expect(out).toContain('<script nonce="NONCEVAL">theme()</script>');
		expect(out).toContain('<script nonce="NONCEVAL">window.__hydration = 1</script>');
		// The module bundle and the JSON data block are left exactly as they were.
		expect(out).toContain('<script type="module" crossorigin src="/assets/app.js"></script>');
		expect(out).toContain('<script type="application/json" id="jb-availability">{}</script>');
	});
});

describe('strictCsp', () => {
	afterEach(() => {
		process.env.UMAMI_HOST = undefined;
	});

	it('pins script execution to self plus the request nonce and locks down the rest', () => {
		const csp = strictCsp('ABC123');
		expect(csp).toContain("script-src 'self' 'nonce-ABC123'");
		expect(csp).toContain("default-src 'self'");
		expect(csp).toContain("object-src 'none'");
		expect(csp).toContain("frame-ancestors 'none'");
		// Inline styles are unavoidable (framework component CSS + inline style attributes).
		expect(csp).toContain("style-src 'self' 'unsafe-inline'");
		// No 'unsafe-inline' for scripts.
		expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
	});

	it('keeps script-src and connect-src first-party when analytics is unset', () => {
		const csp = strictCsp('ABC123');
		expect(csp).toContain("connect-src 'self'");
		expect(csp).not.toContain('https://stats.');
	});

	it('allows the analytics origin in script-src and connect-src when configured', () => {
		process.env.UMAMI_HOST = 'stats.fortunatogeelhoed.com';
		const csp = strictCsp('ABC123');
		expect(csp).toContain(
			"script-src 'self' 'nonce-ABC123' https://stats.fortunatogeelhoed.com",
		);
		expect(csp).toContain("connect-src 'self' https://stats.fortunatogeelhoed.com");
	});
});

describe('DOCS_CSP', () => {
	it('permits the Scalar CDN for the docs page only', () => {
		expect(DOCS_CSP).toContain('https://cdn.jsdelivr.net');
		expect(DOCS_CSP).toContain("script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net");
	});
});

describe('serveHtml', () => {
	it('sets a strict CSP and tags the inline scripts with that request nonce', async () => {
		const app = new Hono();
		app.get('/', (c) => serveHtml(c, '<head><script>theme()</script></head><body>hi</body>'));

		const res = await app.request('/');
		expect(res.status).toBe(200);
		expect(res.headers.get('Cache-Control')).toBe('no-cache');

		const csp = res.headers.get('Content-Security-Policy');
		const nonce = csp?.match(/'nonce-([^']+)'/)?.[1];
		expect(nonce).toBeTruthy();
		// The nonce in the header must match the one tagged onto the inline script, or the browser
		// would block our own script.
		expect(await res.text()).toContain(`<script nonce="${nonce}">theme()</script>`);
	});

	it('uses the given status for the fallback page', async () => {
		const app = new Hono();
		app.get('/', (c) => serveHtml(c, '<p>nope</p>', 404));
		expect((await app.request('/')).status).toBe(404);
	});
});

describe('securityHeaders middleware', () => {
	it('sets the standard hardening headers on a response', async () => {
		const app = new Hono();
		app.use('*', securityHeaders);
		app.get('/', (c) => c.text('ok'));

		const res = await app.request('/');

		expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
		expect(res.headers.get('X-Frame-Options')).toBe('DENY');
		expect(res.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
		// Must keep the Referer for same-origin navigations so /__switch can return the visitor.
		expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
		expect(res.headers.get('Strict-Transport-Security')).toContain('max-age=63072000');
		expect(res.headers.get('Permissions-Policy')).toContain('camera=()');
		// CSP is applied per-response elsewhere, not by this middleware.
		expect(res.headers.get('Content-Security-Policy')).toBeNull();
	});
});
