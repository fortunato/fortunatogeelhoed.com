import { httpResource } from '@angular/common/http';
import { Injectable, computed } from '@angular/core';
import { type Availability, availabilitySchema, readAvailabilitySeed } from '@fg/shared';

// Optimistic default, identical to the server-rendered markup, used when no seed is present.
const DEFAULT: Availability = { available: true, until: '' };

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
	// The value the server injected into the page (or the optimistic default), used until the
	// live fetch resolves and whenever it can't be trusted.
	private readonly seed = readAvailabilitySeed() ?? DEFAULT;

	// Signal-native HTTP: httpResource fetches and exposes the JSON as a signal. The request
	// function returns undefined on the server so no fetch is attempted during prerender.
	private readonly resource = httpResource<unknown>(() =>
		typeof window === 'undefined' ? undefined : '/api/availability',
	);

	// Validate defensively: while loading, on error, or on a malformed body, fall back to the
	// seed so the badge always has a trustworthy value.
	readonly availability = computed<Availability>(() => {
		const parsed = availabilitySchema.safeParse(this.resource.value());
		return parsed.success ? parsed.data : this.seed;
	});

	constructor() {
		// Refetch when the tab regains focus, so a long-open page stays current.
		if (typeof document !== 'undefined') {
			document.addEventListener('visibilitychange', () => {
				if (document.visibilityState === 'visible') this.resource.reload();
			});
		}
	}
}
