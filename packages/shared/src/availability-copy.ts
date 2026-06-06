import type { Availability } from './validation/availability';

// Presentation helpers for the contact-page availability badge and sub-line, shared so the
// React, Vue and Angular variants render byte-identical copy from the same value.

// Badge text (the CSS uppercases it). Booked is phrased plainly, never as an error.
export function availabilityBadge(a: Availability): string {
	if (a.available) return 'Available Now';
	return a.until ? `Booked until ${a.until}` : 'Currently booked';
}

// When booked, the sub-line adapts too: it acknowledges the booking but keeps the door open,
// because new work is usually planned a few weeks ahead. When available, the page uses its
// regular content copy instead, so this is only consulted in the booked state.
export function availabilityBookedLine(a: Availability): string {
	return a.until
		? `Booked until ${a.until}, but I plan new work a few weeks ahead. Tell me what you're building and we'll line up a window.`
		: "I'm booked at the moment, but I plan new work a few weeks ahead. Tell me what you're building and we'll line up a window.";
}
