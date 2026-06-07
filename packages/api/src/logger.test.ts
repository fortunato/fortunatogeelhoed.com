import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger, requestLogger } from './logger';

// requestLogger writes through the module-level `logger`, so spying on that instance lets us
// assert what gets logged without depending on the (silent-in-test) output stream.
function app(): Hono {
	const instance = new Hono();
	instance.use('*', requestLogger());
	instance.get('/health', (c) => c.text('ok'));
	instance.get('/assets/app.js', (c) => c.text('asset'));
	instance.get('/boom', () => {
		throw new Error('kaboom');
	});
	return instance;
}

afterEach(() => vi.restoreAllMocks());

describe('requestLogger', () => {
	it('logs method, path, status and a duration for a normal request', async () => {
		const info = vi.spyOn(logger, 'info').mockImplementation(() => logger);

		const res = await app().request('/health');
		expect(res.status).toBe(200);

		expect(info).toHaveBeenCalledTimes(1);
		const [fields, message] = info.mock.calls[0] as [Record<string, unknown>, string];
		expect(message).toBe('request');
		expect(fields).toMatchObject({ method: 'GET', path: '/health', status: 200 });
		expect(typeof fields.durationMs).toBe('number');
		expect(fields.durationMs as number).toBeGreaterThanOrEqual(0);
	});

	it('skips static asset traffic', async () => {
		const info = vi.spyOn(logger, 'info').mockImplementation(() => logger);

		await app().request('/assets/app.js');

		expect(info).not.toHaveBeenCalled();
	});

	it('captures the final status of a non-2xx response', async () => {
		const info = vi.spyOn(logger, 'info').mockImplementation(() => logger);

		await app().request('/missing');

		const [fields] = info.mock.calls[0] as [Record<string, unknown>];
		expect(fields.status).toBe(404);
	});
});

describe('logger instance', () => {
	it('is a usable logger with the standard level methods', () => {
		for (const level of ['info', 'warn', 'error', 'debug'] as const) {
			expect(typeof logger[level]).toBe('function');
		}
	});

	it('stays on stdout (constructs without throwing) when no Loki credentials are present', async () => {
		vi.resetModules();
		vi.stubEnv('NODE_ENV', 'production');
		vi.stubEnv('LOG_LEVEL', 'silent');
		vi.stubEnv('LOKI_HOST', '');
		vi.stubEnv('LOKI_USER', '');
		vi.stubEnv('LOKI_TOKEN', '');

		const fresh = await import('./logger');
		expect(typeof fresh.logger.info).toBe('function');

		vi.unstubAllEnvs();
		vi.resetModules();
	});
});
