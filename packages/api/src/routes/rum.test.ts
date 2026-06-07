import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';

// The route's job is narrow: read the request body, hand it to the ingest service, and answer
// 204 with no body regardless of what ingest does. The forwarding itself is covered in the
// service test; here we mock ingest so we can prove the handler actually passes the raw body to
// it (a handler that ignored the body would still return 204, so asserting only the status would
// not exercise the route's real behaviour).
const { ingestRum } = vi.hoisted(() => ({ ingestRum: vi.fn() }));
vi.mock('../services/rum', () => ({ ingestRum, RUM_MAX_BYTES: 64 * 1024 }));

const { rumRoute } = await import('./rum');

function app(): Hono {
	const instance = new Hono();
	instance.post('/', ...rumRoute);
	return instance;
}

afterEach(() => vi.clearAllMocks());

describe('rum route', () => {
	it('passes the raw request body to ingest and answers 204', async () => {
		const body = JSON.stringify({ events: [{ name: 'CLS', value: 0.1 }] });
		const res = await app().request('/', { method: 'POST', body });

		expect(res.status).toBe(204);
		expect(await res.text()).toBe('');
		expect(ingestRum).toHaveBeenCalledWith(body);
	});

	it('still answers 204 with an empty body', async () => {
		const res = await app().request('/', { method: 'POST', body: '' });

		expect(res.status).toBe(204);
		expect(await res.text()).toBe('');
		// An empty string is still handed to ingest, which drops it; the route never inspects it.
		expect(ingestRum).toHaveBeenCalledWith('');
	});
});
