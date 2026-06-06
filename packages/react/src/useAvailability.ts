import { type Availability, fetchAvailability, readAvailabilitySeed } from '@fg/shared';
import { useQuery } from '@tanstack/react-query';

// Optimistic default, identical to the server-rendered markup, used when no seed is present.
const DEFAULT: Availability = { available: true, until: '' };

// Live availability via TanStack Query. initialData seeds the cache from the value the server
// injected into the page, so the first render matches the server HTML (no hydration flip). The
// query then refetches in the background and on window focus (a Query default), keeping a
// long-open tab current. A failed fetch throws, so Query retains the last good value rather
// than clobbering it.
export function useAvailability(): Availability {
	const { data } = useQuery({
		queryKey: ['availability'],
		queryFn: async () => {
			const value = await fetchAvailability();
			if (!value) throw new Error('availability unavailable');
			return value;
		},
		initialData: () => readAvailabilitySeed() ?? DEFAULT,
	});

	return data;
}
