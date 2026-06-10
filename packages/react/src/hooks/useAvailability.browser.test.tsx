import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAvailability } from './useAvailability';

// Availability data layer (React): the optimistic default before any seed, reading the
// server-injected seed for the first render, and replacing it with the live query result.
// Mirrors the Vue composable and Angular service tests so the same data behaviour holds across
// all three frameworks. fetch is mocked; the seed lives in a real DOM element.

function seedDocument(value: unknown | null): void {
	document.getElementById('jb-availability')?.remove();
	if (value === null) return;
	const script = document.createElement('script');
	script.id = 'jb-availability';
	script.type = 'application/json';
	script.textContent = JSON.stringify(value);
	document.body.append(script);
}

function wrapper() {
	// No retries and no caching across tests so each query result is observed cleanly.
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false, staleTime: 0, gcTime: 0 } },
	});
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
	fetchMock = vi.fn();
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	seedDocument(null);
	vi.unstubAllGlobals();
});

describe('useAvailability (React)', () => {
	it('falls back to the optimistic available default when there is no seed', () => {
		seedDocument(null);
		// Never resolves, so the first synchronous value is the placeholder.
		fetchMock.mockReturnValue(new Promise(() => {}));
		const { result } = renderHook(() => useAvailability(), { wrapper: wrapper() });
		expect(result.current).toEqual({ available: true, until: '' });
	});

	it('uses the server-injected seed for the first render', () => {
		seedDocument({ available: false, until: 'August 2026' });
		fetchMock.mockReturnValue(new Promise(() => {}));
		const { result } = renderHook(() => useAvailability(), { wrapper: wrapper() });
		expect(result.current).toEqual({ available: false, until: 'August 2026' });
	});

	it('replaces the seed with the live query result once it resolves', async () => {
		seedDocument({ available: true, until: '' });
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ available: false, until: 'September 2026' }), {
				status: 200,
			}),
		);
		const { result } = renderHook(() => useAvailability(), { wrapper: wrapper() });
		await waitFor(() =>
			expect(result.current).toEqual({ available: false, until: 'September 2026' }),
		);
		expect(fetchMock).toHaveBeenCalledWith('/api/availability');
	});

	it('keeps the seed when the live fetch fails', async () => {
		seedDocument({ available: false, until: 'August 2026' });
		fetchMock.mockRejectedValue(new TypeError('offline'));
		const { result } = renderHook(() => useAvailability(), { wrapper: wrapper() });
		// Give the failing query a chance to settle, then confirm the seed still stands.
		await new Promise((r) => setTimeout(r, 50));
		expect(result.current).toEqual({ available: false, until: 'August 2026' });
	});
});
