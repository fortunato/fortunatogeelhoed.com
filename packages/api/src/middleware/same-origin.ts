import type { MiddlewareHandler } from 'hono';

// The RUM proxy is first-party only: the browser posts to it from our own pages, so a genuine
// request always carries an `Origin` that matches the site. Anything cross-origin — or with no
// Origin at all — is not our client and is refused, which closes the easy path to flooding the
// collector from elsewhere.
//
// The expected origin is derived from the forwarded host rather than the request URL, because
// behind a TLS-terminating proxy the app sees an internal `http://host:3000` URL while the
// browser's Origin is the public `https://…` one; comparing host names keeps both in agreement.
export const sameOrigin: MiddlewareHandler = async (c, next) => {
	const origin = c.req.header('origin');
	if (!origin) return c.body(null, 403);

	const host = c.req.header('x-forwarded-host') ?? c.req.header('host');
	try {
		if (host && new URL(origin).host === host) return next();
	} catch {
		// malformed Origin — fall through to refusal
	}
	return c.body(null, 403);
};
