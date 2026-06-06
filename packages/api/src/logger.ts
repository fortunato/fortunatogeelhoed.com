import type { MiddlewareHandler } from 'hono';
import pino, { type Logger } from 'pino';

const isDev = process.env.NODE_ENV !== 'production';
const level =
	process.env.LOG_LEVEL ??
	(process.env.NODE_ENV === 'test' ? 'silent' : isDev ? 'debug' : 'info');

// Structured logging with one firm rule: stdout is always the source of truth and can
// never fail. Shipping logs to a hosted store is layered on top and is strictly optional —
// a missing credential or a transport that won't start degrades to stdout-only rather than
// taking the process down. This keeps logging fire-and-forget: it observes the app, it
// never gets in its way.
function createLogger(): Logger {
	const base = { app: 'fortunatogeelhoed', env: process.env.NODE_ENV ?? 'development' };

	const host = process.env.LOKI_HOST;
	const user = process.env.LOKI_USER;
	const token = process.env.LOKI_TOKEN;

	// Only ship from production, and only when all three credentials are present. Locally we
	// stay on stdout so a dev never needs secrets to run the server.
	if (!isDev && host && user && token) {
		try {
			// Two targets: stdout (always) plus Loki via pino-loki. Batching coalesces pushes
			// to keep the request count low. A failure constructing the transport (the worker
			// thread can be finicky under Bun) is caught below and falls back to plain stdout.
			const transport = pino.transport({
				targets: [
					{ target: 'pino/file', options: { destination: 1 } },
					{
						target: 'pino-loki',
						options: {
							host,
							basicAuth: { username: user, password: token },
							batching: true,
							interval: 5,
							labels: base,
						},
					},
				],
			});
			return pino({ level, base }, transport);
		} catch {
			// Transport could not start — carry on with stdout only.
		}
	}

	return pino({ level, base });
}

export const logger = createLogger();

// Per-request access log: method, path, status and wall-clock duration. Runs around the
// rest of the pipeline and logs after the response is settled, so the status is final.
// Static asset traffic is skipped — it is high-volume and low-signal.
export function requestLogger(): MiddlewareHandler {
	return async (c, next) => {
		if (c.req.path.startsWith('/assets/')) {
			return next();
		}
		const start = performance.now();
		await next();
		logger.info(
			{
				method: c.req.method,
				path: c.req.path,
				status: c.res.status,
				durationMs: Math.round(performance.now() - start),
			},
			'request',
		);
	};
}
