import type { Context } from 'hono';
import { logger } from './logger';

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
// Collection is strictly best-effort: respond 204 immediately and forward fire-and-forget.
// A blocked, slow, or unconfigured collector must never affect the visitor's page.

const COLLECTOR_URL = process.env.FARO_COLLECTOR_URL;
const APP_KEY = process.env.FARO_APP_KEY;
const MAX_BYTES = 64 * 1024;
const TIMEOUT_MS = 3_000;

// Remove identifiers we never want relayed. A sessionless client won't set these, but a
// tampered or out-of-date client could, so we strip them defensively rather than trust input.
function sanitise(payload: unknown): unknown {
	if (payload && typeof payload === 'object') {
		const meta = (payload as Record<string, unknown>).meta;
		if (meta && typeof meta === 'object') {
			// Setting to undefined drops them from the forwarded JSON (JSON.stringify omits
			// undefined), without the performance cost of the delete operator.
			const m = meta as Record<string, unknown>;
			m.session = undefined;
			m.user = undefined;
		}
	}
	return payload;
}

function forward(url: string, payload: unknown): void {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
	const headers: Record<string, string> = { 'content-type': 'application/json' };
	if (APP_KEY) headers['x-api-key'] = APP_KEY;
	fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify(payload),
		signal: controller.signal,
	})
		.catch((err) => logger.warn({ err: String(err) }, 'rum forward failed'))
		.finally(() => clearTimeout(timeout));
}

export async function handleRum(c: Context): Promise<Response> {
	const raw = await c.req.text().catch(() => '');

	// Size-cap and basic-validate before doing anything with it. An empty body, an oversized
	// body, or a collector that isn't configured (e.g. local dev) all just get a quiet 204.
	if (!raw || raw.length > MAX_BYTES || !COLLECTOR_URL) {
		return c.body(null, 204);
	}

	let payload: unknown;
	try {
		payload = sanitise(JSON.parse(raw));
	} catch {
		return c.body(null, 204);
	}

	// Fire-and-forget: do not await before responding.
	forward(COLLECTOR_URL, payload);
	return c.body(null, 204);
}
