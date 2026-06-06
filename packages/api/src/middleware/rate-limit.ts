import { rateLimiter } from 'hono-rate-limiter';
import { clientIp } from './client-ip';

// Per-IP rate limiting for the JSON API. The counters live in the default in-memory store —
// correct for a single container and consistent with the in-process availability cache; behind
// multiple replicas the limits would be per-instance, which is a deliberate non-goal here.
const MINUTE = 60_000;

function ipLimiter(windowMs: number, limit: number) {
	return rateLimiter({
		windowMs,
		limit,
		standardHeaders: 'draft-7',
		keyGenerator: clientIp,
		message: { error: 'Too many requests, please retry later.' },
	});
}

// A human submits the contact form a handful of times at most; anything past that is automated.
export const contactRateLimit = ipLimiter(10 * MINUTE, 5);

// The badge is fetched roughly once per page and already cache-shielded, so the ceiling only
// exists to blunt a pathological loop.
export const availabilityRateLimit = ipLimiter(MINUTE, 120);

// Telemetry is chatty (Web Vitals plus errors per page), so the ceiling is generous; it caps a
// flood that would run up log/ingest cost rather than policing normal browsing.
export const rumRateLimit = ipLimiter(MINUTE, 100);
