import { type Availability, availabilitySchema } from '@fg/shared/validation/availability';
import { logger } from '../logger';

// The contact-page badge is driven by a value Fortunato edits in a GitHub gist, so he can
// flip his availability from a phone without a redeploy. This module reads that gist and
// shields both GitHub and the visitor from each other:
//
//   - a short TTL cache means visitor traffic almost never reaches GitHub;
//   - a conditional request (ETag / If-None-Match) makes the refreshes that do happen free
//     against the rate limit (a 304 doesn't count);
//   - single-flight collapses concurrent refreshes into one upstream call;
//   - stale-on-error keeps serving the last good value through an outage, and a cold start
//     with no value yet falls back to "available" (optimistic: never wrongly show "booked").
//
// The function never throws and never hangs: every failure path resolves to a valid value.
// A simple in-process cache is deliberate; see repo/docs/availability.md for why not Redis.

const GIST_ID = process.env.AVAILABILITY_GIST_ID ?? '6b9e17e49b45c78833cc2b4a5ab0c771';
const GIST_URL = `https://api.github.com/gists/${GIST_ID}`;
// The file within the gist that holds the value. Overridable alongside the gist id so both
// halves of the coordinate (which gist, which file) move together, and named once here so the
// lookup and the "missing" error message can never disagree.
const GIST_FILENAME = process.env.AVAILABILITY_GIST_FILE ?? 'fg-availability.json';
const TOKEN = process.env.GITHUB_TOKEN;
const TTL_MS = Number(process.env.AVAILABILITY_TTL_MS) || 120_000;
const TIMEOUT_MS = 3_000;

// Optimistic default: if we have never managed to read the gist, assume available rather
// than turning visitors away with a "booked" badge we can't actually substantiate.
const FALLBACK: Availability = { available: true, until: '' };

interface Entry {
	value: Availability;
	etag?: string;
	fetchedAt: number;
}

let cache: Entry | null = null;
let lastAttempt = 0;
let inflight: Promise<void> | null = null;

// Read the gist, validate it, and update the cache. Never throws — every error path leaves
// the previous good value in place (stale-on-error) and only logs. `lastAttempt` is stamped
// up front so a sustained outage is throttled to one attempt per TTL instead of one per
// request.
async function refresh(): Promise<void> {
	lastAttempt = Date.now();
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
	// Severity reflects impact, so alerting can be meaningful: a failure while we still hold a
	// good value is degraded-but-serving (warn); a failure with no value at all means we are
	// serving the blind optimistic fallback (error).
	const sev = cache ? 'warn' : 'error';
	try {
		const headers: Record<string, string> = {
			Accept: 'application/vnd.github+json',
			'User-Agent': 'fortunatogeelhoed.com',
		};
		if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
		if (cache?.etag) headers['If-None-Match'] = cache.etag;

		const res = await fetch(GIST_URL, { headers, signal: controller.signal });

		// Not modified: the value is unchanged, so just mark it fresh again. This is the
		// common case and costs nothing against the rate limit.
		if (res.status === 304 && cache) {
			cache = { ...cache, fetchedAt: Date.now() };
			logger.debug('availability unchanged (304)');
			return;
		}

		if (!res.ok) {
			logger[sev]({ status: res.status }, 'availability upstream error');
			return;
		}

		const body = (await res.json()) as { files?: Record<string, { content?: string }> };
		const content = body?.files?.[GIST_FILENAME]?.content;
		if (typeof content !== 'string') {
			logger[sev]({ file: GIST_FILENAME }, 'availability gist is missing its file');
			return;
		}

		const parsed = availabilitySchema.safeParse(JSON.parse(content));
		if (!parsed.success) {
			logger[sev]({ issues: parsed.error.issues }, 'availability gist failed validation');
			return;
		}

		cache = {
			value: parsed.data,
			etag: res.headers.get('etag') ?? undefined,
			fetchedAt: Date.now(),
		};
		logger.debug({ available: parsed.data.available }, 'availability refreshed');
	} catch (err) {
		// Timeout (abort), network failure, or malformed JSON — keep the stale value.
		logger[sev]({ err: String(err) }, 'availability fetch failed');
	} finally {
		clearTimeout(timeout);
	}
}

export async function getAvailability(): Promise<Availability> {
	const now = Date.now();
	const current = cache;

	// Fast path: a fresh cached value serves the overwhelming majority of requests.
	if (current && now - current.fetchedAt < TTL_MS) return current.value;

	// Throttle: outside the TTL we attempt at most one refresh per TTL window, so an upstream
	// outage can't turn into a storm of retries. Until then, serve the last value (or the
	// optimistic fallback on a cold start).
	if (now - lastAttempt < TTL_MS) return current?.value ?? FALLBACK;

	// Single-flight: collapse concurrent refreshes into one upstream call.
	if (!inflight) {
		inflight = refresh().finally(() => {
			inflight = null;
		});
	}
	await inflight;

	return cache?.value ?? FALLBACK;
}
