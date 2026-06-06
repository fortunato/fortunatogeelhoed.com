import { type Availability, availabilitySchema } from './validation/availability';

// Client-side helpers for the contact-page availability badge. Kept framework-agnostic so the
// React hook, Vue composable and Angular service share identical fetch + seed behaviour.

// Read the server-injected seed. On the contact page in production the server rewrites the
// badge markup to the live value and drops the same value into a JSON <script>; reading it
// here lets the client's first render match that markup exactly, so hydration neither
// mismatches nor flips. Absent (dev, or any other page) it returns null and the caller uses
// its optimistic default.
export function readAvailabilitySeed(): Availability | null {
	if (typeof document === 'undefined') return null;
	const el = document.getElementById('jb-availability');
	if (!el?.textContent) return null;
	try {
		const parsed = availabilitySchema.safeParse(JSON.parse(el.textContent));
		return parsed.success ? parsed.data : null;
	} catch {
		return null;
	}
}

// Fetch the live value from the API and validate it. Returns null on any failure (network,
// parse, validation) so callers can simply keep their current value.
export async function fetchAvailability(): Promise<Availability | null> {
	try {
		const res = await fetch('/api/availability');
		const parsed = availabilitySchema.safeParse(await res.json());
		return parsed.success ? parsed.data : null;
	} catch {
		return null;
	}
}
