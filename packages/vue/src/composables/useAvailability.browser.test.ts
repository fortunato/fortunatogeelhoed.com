import type { Availability } from '@fg/shared';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { cleanup, render, waitFor } from '@testing-library/vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type Ref, defineComponent, h } from 'vue';
import { useAvailability } from './useAvailability';

// Availability data layer (Vue): the optimistic default before any seed, reading the
// server-injected seed for the first render, and replacing it with the live query result.
// Mirrors the React hook and Angular service tests so the same data behaviour holds across all
// three frameworks. fetch is mocked; the seed lives in a real DOM element.

function seedDocument(value: unknown | null): void {
	document.getElementById('jb-availability')?.remove();
	if (value === null) return;
	const script = document.createElement('script');
	script.id = 'jb-availability';
	script.type = 'application/json';
	script.textContent = JSON.stringify(value);
	document.body.append(script);
}

// Mount a probe component that exposes the composable's reactive value, with a fresh query client
// so nothing leaks between tests.
function mountProbe(): { availability: Ref<Availability> } {
	const captured: { availability: Ref<Availability> } = {
		availability: undefined as unknown as Ref<Availability>,
	};
	const Probe = defineComponent({
		setup() {
			const { availability } = useAvailability();
			captured.availability = availability;
			return () => h('div', availability.value.until);
		},
	});
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false, staleTime: 0, gcTime: 0 } },
	});
	render(Probe, { global: { plugins: [[VueQueryPlugin, { queryClient: client }]] } });
	return captured;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
	fetchMock = vi.fn();
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	cleanup();
	seedDocument(null);
	vi.unstubAllGlobals();
});

describe('useAvailability (Vue)', () => {
	it('falls back to the optimistic available default when there is no seed', () => {
		seedDocument(null);
		fetchMock.mockReturnValue(new Promise(() => {}));
		const { availability } = mountProbe();
		expect(availability.value).toEqual({ available: true, until: '' });
	});

	it('uses the server-injected seed for the first render', () => {
		seedDocument({ available: false, until: 'August 2026' });
		fetchMock.mockReturnValue(new Promise(() => {}));
		const { availability } = mountProbe();
		expect(availability.value).toEqual({ available: false, until: 'August 2026' });
	});

	it('replaces the seed with the live query result once it resolves', async () => {
		seedDocument({ available: true, until: '' });
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ available: false, until: 'September 2026' }), {
				status: 200,
			}),
		);
		const { availability } = mountProbe();
		await waitFor(() =>
			expect(availability.value).toEqual({ available: false, until: 'September 2026' }),
		);
		expect(fetchMock).toHaveBeenCalledWith('/api/availability');
	});

	it('keeps the seed when the live fetch fails', async () => {
		seedDocument({ available: false, until: 'August 2026' });
		fetchMock.mockRejectedValue(new TypeError('offline'));
		const { availability } = mountProbe();
		await new Promise((r) => setTimeout(r, 50));
		expect(availability.value).toEqual({ available: false, until: 'August 2026' });
	});
});
