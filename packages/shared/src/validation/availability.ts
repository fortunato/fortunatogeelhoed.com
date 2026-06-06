import { z } from 'zod';

// Single source of truth for the availability signal that drives the contact-page badge.
// The same schema validates the value on both ends: the API uses it to reject a malformed
// source before it can reach the UI, and each framework uses it to validate the response
// before trusting it. `until` is only meaningful when `available` is false; it is sanitised
// (trimmed, length-capped) here so nothing unbounded can ever land in the rendered badge.
export const availabilitySchema = z.object({
	available: z.boolean(),
	until: z.string().trim().max(40).optional().default(''),
});

export type Availability = z.infer<typeof availabilitySchema>;
