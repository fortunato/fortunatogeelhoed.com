import { SITE_URL } from '@fg/shared';
import type { MiddlewareHandler } from 'hono';

// First-party guard for the RUM proxy. The browser posts to it from our own pages, so a genuine
// request is same-origin; anything cross-origin, or with no first-party signal at all, is refused.
// That closes the easy path to flooding the collector from elsewhere.
//
// Why not hono/csrf, which even ships an `origin` allow-list? Two reasons. First, it acts only on
// form-style content types (application/x-www-form-urlencoded, multipart/form-data, text/plain) and
// deliberately ignores application/json, on the reasoning that JSON cannot be sent cross-site by a
// simple form without a CORS preflight. Faro posts to /api/rum as application/json (see
// packages/shared/src/rum.ts), so hono/csrf would skip every RUM request and guard nothing. Second,
// its job is narrower than ours: it blocks state-changing form posts and admits a request on either
// a Sec-Fetch-Site or an Origin match, never refusing a missing Origin. We want a
// content-type-agnostic first-party gate that also rejects no-Origin requests. We do borrow its
// best idea: preferring the Fetch Metadata Sec-Fetch-Site signal.
//
// The decision rests only on values the browser sets and a cross-origin page cannot forge:
// Sec-Fetch-Site first, then the Origin host against a fixed allow-list. It never trusts a header
// the request uses to describe itself (Host and X-Forwarded-Host are attacker-controllable on any
// request that reaches the app directly, so using them to define "same origin" would let a caller
// assert both sides of the comparison). The allow-list is the canonical site host, an optional
// deployment override (PUBLIC_HOST, for example a preview domain), and localhost for development.
// Sec-Fetch-Site and Origin are unforgeable by web page script but can still be set by a non-browser
// client; that is acceptable here because such traffic is rate-limited and the endpoint is a
// fire-and-forget 204. The guard exists to stop browser-based cross-origin abuse.
function allowedHosts(): ReadonlySet<string> {
	const hosts = new Set<string>();
	try {
		hosts.add(new URL(SITE_URL).host.toLowerCase());
	} catch {
		// SITE_URL is a build-time constant; this guard is belt-and-suspenders.
	}
	const override = process.env.PUBLIC_HOST?.trim().toLowerCase();
	if (override) hosts.add(override);
	return hosts;
}

const ALLOWED = allowedHosts();

function isLocalhost(hostname: string): boolean {
	return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

function isAllowedOrigin(origin: string): boolean {
	try {
		const url = new URL(origin);
		return ALLOWED.has(url.host.toLowerCase()) || isLocalhost(url.hostname);
	} catch {
		return false; // malformed Origin
	}
}

export const sameOrigin: MiddlewareHandler = async (c, next) => {
	// Fetch Metadata, set by the browser and unforgeable by page script: a same-origin fetch is our
	// canonical first-party case, so trust it directly when the browser reports it.
	if (c.req.header('sec-fetch-site') === 'same-origin') return next();

	// Fallback for clients that do not send Fetch Metadata: the Origin host must be one we control.
	const origin = c.req.header('origin');
	if (origin && isAllowedOrigin(origin)) return next();

	return c.body(null, 403);
};
