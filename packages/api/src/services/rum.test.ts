import { afterEach, describe, expect, it, vi } from 'vitest';

// The collector URL is read at module load, so each test re-imports ingestRum with the env it
// needs. ingestRum forwards fire-and-forget but calls fetch synchronously, so a stubbed fetch is
// observable immediately after the call returns.
async function loadIngest(url = 'https://collector.test/ingest') {
	vi.resetModules();
	vi.stubEnv('FARO_COLLECTOR_URL', url);
	return (await import('./rum')).ingestRum;
}

function stubFetch() {
	const fetchMock = vi.fn().mockResolvedValue(new Response(null));
	vi.stubGlobal('fetch', fetchMock);
	return fetchMock;
}

type ForwardInit = { method: string; body: string; headers: Record<string, string> };

// The forwarded request's init, typed (indexed access is `| undefined` under strict tsconfig).
function forwardInit(fetchMock: ReturnType<typeof stubFetch>): ForwardInit {
	return fetchMock.mock.calls[0]?.[1] as ForwardInit;
}

afterEach(() => {
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
});

describe('ingestRum', () => {
	it('forwards a valid payload to the configured collector', async () => {
		const fetchMock = stubFetch();
		const ingestRum = await loadIngest();

		ingestRum(JSON.stringify({ events: [1, 2] }));

		expect(fetchMock).toHaveBeenCalledOnce();
		expect(fetchMock.mock.calls[0]?.[0]).toBe('https://collector.test/ingest');
		const init = forwardInit(fetchMock);
		expect(init.method).toBe('POST');
		expect(JSON.parse(init.body)).toEqual({ events: [1, 2] });
	});

	it('strips session and user identifiers before forwarding', async () => {
		const fetchMock = stubFetch();
		const ingestRum = await loadIngest();

		ingestRum(JSON.stringify({ meta: { session: 's', user: 'u', app: 'portfolio' } }));

		const body = JSON.parse(forwardInit(fetchMock).body);
		expect(body.meta).toEqual({ app: 'portfolio' });
	});

	it('drops an empty, oversized, or malformed body', async () => {
		const fetchMock = stubFetch();
		const ingestRum = await loadIngest();

		ingestRum('');
		ingestRum('x'.repeat(70 * 1024)); // over the 64 KB cap
		ingestRum('{ not json');

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('drops a payload under the character count but over the byte budget', async () => {
		const fetchMock = stubFetch();
		const ingestRum = await loadIngest();

		// ~30k multi-byte characters: well under 64k as a JS string length, but ~90k bytes in UTF-8,
		// so a byte-aware cap must reject it (a length-based cap would have let it through).
		ingestRum(JSON.stringify({ s: '€'.repeat(30 * 1024) }));

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('drops everything when no collector is configured', async () => {
		const fetchMock = stubFetch();
		const ingestRum = await loadIngest(''); // FARO_COLLECTOR_URL unset

		ingestRum(JSON.stringify({ a: 1 }));

		expect(fetchMock).not.toHaveBeenCalled();
	});
});
