import type { Context } from 'hono';
import { secureHeaders } from 'hono/secure-headers';

// Standard hardening headers on every response. Hono's defaults already cover most of the set
// (X-Content-Type-Options: nosniff, X-Frame-Options, Cross-Origin-Opener-Policy: same-origin,
// Cross-Origin-Resource-Policy: same-origin, HSTS, X-XSS-Protection: 0, and more); we override a
// few. Referrer-Policy is deliberately 'strict-origin-when-cross-origin' rather than the library
// default 'no-referrer': the framework switch at /__switch reads the Referer header to send the
// visitor back to the page they came from, and 'no-referrer' would strip it and bounce every switch
// to the home page. The Content-Security-Policy is NOT set here; it is applied per response (see
// strictCsp / DOCS_CSP) so the HTML pages can carry a fresh per-request nonce.
export const securityHeaders = secureHeaders({
	xFrameOptions: 'DENY',
	referrerPolicy: 'strict-origin-when-cross-origin',
	strictTransportSecurity: 'max-age=63072000; includeSubDomains; preload',
	permissionsPolicy: { camera: [], microphone: [], geolocation: [], browsingTopics: [] },
});

// Per-request nonce for the strict script-src.
export function generateNonce(): string {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

// Tag the page's inline scripts with the request nonce. The inline scripts in the prerendered pages
// (the theme resolver in every framework, React's hydration state) carry no other attributes, so a
// bare `<script>` is exactly those; module bundles (`type="module" src=...`) and the availability
// seed (`type="application/json"`) carry attributes and are left untouched. Bundles are same-origin
// and covered by 'self'; the JSON seed is data, not script. Any literal `<script>` in page copy is
// HTML-escaped during prerender, so it never matches here.
export function withNonce(html: string, nonce: string): string {
	return html.replaceAll('<script>', `<script nonce="${nonce}">`);
}

// The self-hosted analytics origin (the stats subdomain Caddy fronts), derived from the same env
// that drives the tracking tag. When set it is the one cross-origin host the strict CSP allows, for
// loading the Umami script and for its same-host beacon. Empty turns the allowance off, so the
// policy stays first-party-only on localhost and previews.
function analyticsOrigin(): string {
	const host = process.env.UMAMI_HOST?.trim();
	return host ? `https://${host}` : '';
}

// Strict, first-party-only policy for the site's own HTML (production). style-src must allow inline
// styles: the frameworks emit inline <style> blocks (Vue/Angular component CSS) and inline style=""
// attributes (timeline ticks) that cannot be nonced or hashed without rebuild-fragile machinery.
// Script execution stays locked to same-origin bundles plus the per-request nonce, with the lone
// exception of the self-hosted analytics origin (its loader script and beacon) when configured.
export function strictCsp(nonce: string): string {
	const analytics = analyticsOrigin();
	const scriptSrc = analytics
		? `script-src 'self' 'nonce-${nonce}' ${analytics}`
		: `script-src 'self' 'nonce-${nonce}'`;
	const connectSrc = analytics ? `connect-src 'self' ${analytics}` : "connect-src 'self'";
	return [
		"default-src 'self'",
		"base-uri 'self'",
		"object-src 'none'",
		scriptSrc,
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data:",
		"font-src 'self'",
		connectSrc,
		"form-action 'self'",
		"frame-ancestors 'none'",
		'upgrade-insecure-requests',
	].join('; ');
}

// Serve a first-party HTML document with a per-request CSP nonce: the nonce is pinned in script-src
// and tagged onto the page's inline scripts, so inline execution is allowed only for our own. HTML
// is always no-cache because it is rewritten per request (theme, availability, nonce).
export function serveHtml(c: Context, html: string, status: 200 | 404 = 200): Response {
	const nonce = generateNonce();
	c.header('Content-Security-Policy', strictCsp(nonce));
	c.header('Cache-Control', 'no-cache');
	return c.html(withNonce(html, nonce), status);
}

// The Scalar API reference (/api/docs) loads its bundle from jsdelivr and injects an inline init
// script plus inline styles, so it gets its own relaxed policy rather than the site's strict one.
export const DOCS_CSP = [
	"default-src 'self'",
	"base-uri 'self'",
	"script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
	"style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
	"img-src 'self' data: https://cdn.jsdelivr.net",
	"font-src 'self' data: https://cdn.jsdelivr.net https://fonts.gstatic.com",
	"connect-src 'self' https://cdn.jsdelivr.net",
	"worker-src 'self' blob:",
	"frame-ancestors 'none'",
].join('; ');
