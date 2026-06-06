import type { Context } from 'hono';

// Bun passes the server handle as the fetch env; its `requestIP` yields the socket address. We
// read it directly rather than importing `hono/bun`, whose module graph touches the `Bun` global
// at load time and so cannot be imported under the Node-based test runner.
interface BunServer {
	requestIP?: (req: Request) => { address?: string } | null;
}

function socketAddress(c: Context): string | undefined {
	const env: unknown = c.env;
	if (!env || typeof env !== 'object') return undefined;
	const server = ('server' in env ? (env as { server?: unknown }).server : env) as
		| BunServer
		| undefined;
	try {
		return server?.requestIP?.(c.req.raw)?.address ?? undefined;
	} catch {
		return undefined;
	}
}

// Resolve the visitor address for rate-limiting. `X-Forwarded-For` is forgeable, so it is only
// believed when the deployment explicitly declares a proxy in front — never by default, which
// would let a direct caller spoof the header to dodge the limiter. Resolution order:
//
//   1. CLIENT_IP_HEADER   → a single edge-set header (e.g. `cf-connecting-ip`, `fly-client-ip`).
//                           The platform overwrites it, so it is not forgeable when present.
//   2. TRUSTED_PROXY_HOPS → the number of proxies that append `X-Forwarded-For` in front of us.
//                           When > 0, we take the entry the outermost trusted proxy added —
//                           counting that many from the right — so a client-supplied value on
//                           the left is ignored. Defaults to 0: XFF is not trusted at all.
//   3. socket address     → the direct connection (correct when there is no proxy).
const CLIENT_IP_HEADER = process.env.CLIENT_IP_HEADER;
const TRUSTED_PROXY_HOPS = Number(process.env.TRUSTED_PROXY_HOPS) || 0;

export function clientIp(c: Context): string {
	const edge = CLIENT_IP_HEADER && c.req.header(CLIENT_IP_HEADER)?.trim();
	if (edge) return edge;

	if (TRUSTED_PROXY_HOPS > 0) {
		const hops = c.req
			.header('x-forwarded-for')
			?.split(',')
			.map((entry) => entry.trim())
			.filter(Boolean);
		const trusted = hops?.[hops.length - TRUSTED_PROXY_HOPS];
		if (trusted) return trusted;
	}

	// No trusted forwarded address — fall back to the socket. There is none for an in-process
	// app.request during tests; collapse that to a shared key.
	return socketAddress(c) ?? 'unknown';
}
