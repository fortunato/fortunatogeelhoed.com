import { describe, expect, it } from 'vitest';
import { availabilityBadge, availabilityBookedLine } from './availability-copy';
import type { Availability } from './validation/availability';

function value(available: boolean, until = ''): Availability {
	return { available, until };
}

describe('availabilityBadge', () => {
	it('reads as available regardless of any until value', () => {
		expect(availabilityBadge(value(true))).toBe('Available Now');
		expect(availabilityBadge(value(true, 'August 2026'))).toBe('Available Now');
	});

	it('names the booked-until date when one is present', () => {
		expect(availabilityBadge(value(false, 'August 2026'))).toBe('Booked until August 2026');
	});

	it('falls back to a plain booked label when no date is given', () => {
		expect(availabilityBadge(value(false))).toBe('Currently booked');
	});
});

describe('availabilityBookedLine', () => {
	it('acknowledges the booking date while keeping the door open', () => {
		const line = availabilityBookedLine(value(false, 'August 2026'));
		expect(line).toContain('Booked until August 2026');
		expect(line).toContain('plan new work a few weeks ahead');
	});

	it('uses the dateless phrasing when no until is set', () => {
		const line = availabilityBookedLine(value(false));
		expect(line).toBe(
			"I'm booked at the moment, but I plan new work a few weeks ahead. Tell me what you're building and we'll line up a window.",
		);
	});
});
