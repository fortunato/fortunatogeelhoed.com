import { logger } from '../logger';

// First-party proxy for frontend real-user-monitoring (Grafana Faro). The browser posts its
// errors and Web Vitals here instead of straight to Grafana's collector, which buys two
// things: it stays first-party (no third-party request to block, and the collector key never
// ships to the browser), and the visitor's IP is stripped for free — the forward originates
// from this server, so Grafana sees the server's address, never the visitor's.
//
// Why this matters for consent: see repo/docs/frontend-telemetry.md. The short version is the
// client runs sessionless (no stored identifier), so there is no banner to show; this proxy
// makes the network side match that privacy posture.
//
// This module is the pure forwarding logic; the HTTP glue (read body, answer 204) lives in the
// route at routes/rum.ts. Collection is strictly best-effort: a blocked, slow, or unconfigured
// collector must never affect the visitor's page.

// The collector URL embeds Grafana Faro's write key in its path (.../collect/<key>), so the URL is
// the whole credential and there is no separate header to send. Keeping it server-side is what hides
// that key from the browser.
const COLLECTOR_URL = process.env.FARO_COLLECTOR_URL;
// The body-size cap, shared with the route's bodyLimit so the two never disagree.
export const RUM_MAX_BYTES = 64 * 1024;
const TIMEOUT_MS = 3_000;

// Return a copy with the identifiers we never relay removed. A sessionless client won't set
// these, but a tampered or out-of-date one could, so we strip them defensively rather than trust
// input. We clone rather than mutate so the caller's parsed object is never altered as a side
// effect. Setting the keys to undefined drops them from the forwarded JSON (JSON.stringify omits
// undefined), without the cost of the delete operator.
function sanitise(payload: unknown): unknown {
	if (payload && typeof payload === 'object') {
		const obj = payload as Record<string, unknown>;
		const meta = obj.meta;
		if (meta && typeof meta === 'object') {
			return {
				...obj,
				meta: { ...(meta as Record<string, unknown>), session: undefined, user: undefined },
			};
		}
	}
	return payload;
}

function forward(url: string, payload: unknown): void {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
	fetch(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(payload),
		signal: controller.signal,
	})
		.catch((err) => logger.warn({ err: String(err) }, 'rum forward failed'))
		.finally(() => clearTimeout(timeout));
}

// Best-effort ingest of a raw request body: size-cap, strip identifiers, forward fire-and-forget.
// Never throws — an empty body, an oversized body, malformed JSON, or a collector that isn't
// configured (e.g. local dev) are all simply dropped. The route answers 204 regardless.
export function ingestRum(raw: string): void {
	// Measure real bytes, not string length: the cap is a byte budget shared with the route's
	// bodyLimit, and a multi-byte payload can be well over it while its `.length` is under.
	if (!raw || Buffer.byteLength(raw) > RUM_MAX_BYTES || !COLLECTOR_URL) return;

	let payload: unknown;
	try {
		payload = sanitise(JSON.parse(raw));
	} catch {
		return;
	}

	forward(COLLECTOR_URL, payload);
}
