import { type Availability, fetchAvailability, readAvailabilitySeed } from '@fg/shared';
import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

// Optimistic default, identical to the server-rendered markup, used when no seed is present.
const DEFAULT: Availability = { available: true, until: '' };

// Live availability via TanStack Query. initialData seeds the cache from the value the server
// injected into the page, so the first render matches the server HTML (no hydration flip). The
// query refetches in the background and on window focus (a Query default). A failed fetch
// throws, so Query keeps the last good value rather than clobbering it.
export function useAvailability() {
	const { data } = useQuery({
		queryKey: ['availability'],
		queryFn: async () => {
			const value = await fetchAvailability();
			if (!value) throw new Error('availability unavailable');
			return value;
		},
		initialData: () => readAvailabilitySeed() ?? DEFAULT,
	});

	// initialData guarantees a value at runtime; the computed narrows the type for callers.
	const availability = computed<Availability>(() => data.value ?? DEFAULT);
	return { availability };
}
