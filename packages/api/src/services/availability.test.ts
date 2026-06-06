import type { Availability } from '@fg/shared/validation/availability';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The cache lives in module-level state, so each test gets a fresh module via vi.resetModules()
// + dynamic import (no test-only reset hook on the production module). Fake timers let us age a
// populated cache past its TTL to exercise the refresh / 304 / stale-on-error paths through the
// real public API, rather than poking internals.
const TTL_MS = 120_000;

let getAvailability: typeof import('./availability').getAvailability;

beforeEach(async () => {
	vi.resetModules();
	vi.useFakeTimers();
	({ getAvailability } = await import('./availability'));
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

// Build a GitHub gist API response wrapping the given availability value.
function gistResponse(value: unknown, etag = '"v1"'): Response {
	return new Response(
		JSON.stringify({ files: { 'availability.json': { content: JSON.stringify(value) } } }),
		{ status: 200, headers: { etag } },
	);
}

const AVAILABLE: Availability = { available: true, until: '' };
const BOOKED: Availability = { available: false, until: 'August' };

describe('getAvailability', () => {
	it('reads and validates the gist value', async () => {
		const fetchMock = vi.fn().mockResolvedValue(gistResponse(BOOKED));
		vi.stubGlobal('fetch', fetchMock);

		expect(await getAvailability()).toEqual(BOOKED);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('serves a fresh value from cache without re-fetching', async () => {
		const fetchMock = vi.fn().mockResolvedValue(gistResponse(BOOKED));
		vi.stubGlobal('fetch', fetchMock);

		await getAvailability();
		await getAvailability();

		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('keeps the cached value on a 304 and sends a conditional request', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(gistResponse(AVAILABLE, '"etag-1"'))
			.mockResolvedValueOnce(new Response(null, { status: 304 }));
		vi.stubGlobal('fetch', fetchMock);

		await getAvailability();
		vi.advanceTimersByTime(TTL_MS + 1); // age the cache past its TTL
		expect(await getAvailability()).toEqual(AVAILABLE);

		expect(fetchMock).toHaveBeenCalledTimes(2);
		const secondCallInit = fetchMock.mock.calls[1]?.[1] as { headers: Record<string, string> };
		expect(secondCallInit.headers['If-None-Match']).toBe('"etag-1"');
	});

	it('serves the last good value when a refresh fails (stale-on-error)', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(gistResponse(BOOKED))
			.mockRejectedValueOnce(new Error('network down'));
		vi.stubGlobal('fetch', fetchMock);

		await getAvailability();
		vi.advanceTimersByTime(TTL_MS + 1);

		expect(await getAvailability()).toEqual(BOOKED);
	});

	it('falls back to optimistic-available on a cold-start error', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));

		expect(await getAvailability()).toEqual(AVAILABLE);
	});

	it('falls back when the gist content is not valid JSON', async () => {
		const bad = new Response(
			JSON.stringify({ files: { 'availability.json': { content: 'not json{' } } }),
			{ status: 200 },
		);
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(bad));

		expect(await getAvailability()).toEqual(AVAILABLE);
	});

	it('falls back when the gist is missing the availability file', async () => {
		const empty = new Response(JSON.stringify({ files: {} }), { status: 200 });
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(empty));

		expect(await getAvailability()).toEqual(AVAILABLE);
	});

	it('serves the value and a cache-control header through the real registered route', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(gistResponse(BOOKED)));

		// Drive the actual app from index.ts (full middleware chain + registered routes), so a
		// drift in the route path or header would fail here.
		const { app } = await import('../index');

		const res = await app.request('/api/availability');
		expect(res.status).toBe(200);
		expect(res.headers.get('Cache-Control')).toContain('max-age=60');
		expect(await res.json()).toEqual(BOOKED);
	});
});
