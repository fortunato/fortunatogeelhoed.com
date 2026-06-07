import { type Availability, fetchAvailability, readAvailabilitySeed } from '@fg/shared';
import { useQuery } from '@tanstack/react-query';

// Optimistic default, identical to the server-rendered markup, used when no seed is present.
const DEFAULT: Availability = { available: true, until: '' };

// Live availability via TanStack Query. The value the server injected into the page (or the
// optimistic default) is supplied as placeholderData, so the first render matches the server
// HTML (no hydration flip) while the query still fetches eagerly on mount. Using placeholderData
// rather than initialData is the key: initialData is cached as a real value and held fresh for
// staleTime, which suppresses the fetch; placeholderData is display-only, so the request always
// fires. A failed fetch throws, so data is undefined and the badge falls back to the seed.
export function useAvailability(): Availability {
	const seed = readAvailabilitySeed() ?? DEFAULT;
	const { data } = useQuery({
		queryKey: ['availability'],
		queryFn: async () => {
			const value = await fetchAvailability();
			if (!value) throw new Error('availability unavailable');
			return value;
		},
		placeholderData: seed,
	});

	return data ?? seed;
}
