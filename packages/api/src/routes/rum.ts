import type { Context } from 'hono';
import { describeRoute } from 'hono-openapi';
import { ingestRum } from '../services/rum';

// First-party proxy for frontend RUM (Grafana Faro). Strips identifiers, hides the collector
// key, and forwards fire-and-forget. The forwarding logic lives in rum.ts; this binds it to the
// route and describes it. It answers immediately with no body regardless of outcome.

const spec = describeRoute({
	tags: ['Telemetry'],
	summary: 'Real-user-monitoring ingest',
	description:
		'First-party proxy for frontend Web Vitals and errors. Strips identifiers and forwards ' +
		'fire-and-forget, so it always answers immediately with no body regardless of outcome.',
	responses: {
		204: { description: 'Accepted (fire-and-forget); no content.' },
		403: { description: 'Rejected: not a first-party (same-origin) request.' },
		413: { description: 'Payload exceeds the size limit.' },
		429: { description: 'Rate limit exceeded.' },
	},
});

// Always answer immediately with no body; ingest is best-effort and never blocks the response.
async function handler(c: Context): Promise<Response> {
	ingestRum(await c.req.text().catch(() => ''));
	return c.body(null, 204);
}

export const rumRoute = [spec, handler] as const;
