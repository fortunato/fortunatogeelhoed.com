import { describe, expect, it } from 'vitest';
import { availabilitySchema } from './availability';

// The availability value is read from an external source (a gist) and rendered into the
// contact-page badge, so the schema is the gate that keeps anything malformed or unbounded
// out of the UI. These assertions pin that contract.
describe('availabilitySchema', () => {
	it('accepts a well-formed available value', () => {
		const result = availabilitySchema.safeParse({ available: true, until: '' });
		expect(result.success && result.data).toEqual({ available: true, until: '' });
	});

	it('accepts a booked value with an until date', () => {
		const result = availabilitySchema.safeParse({ available: false, until: 'August 2026' });
		expect(result.success && result.data.until).toBe('August 2026');
	});

	it('defaults until to an empty string when omitted', () => {
		const result = availabilitySchema.safeParse({ available: true });
		expect(result.success && result.data.until).toBe('');
	});

	it('trims surrounding whitespace on until', () => {
		const result = availabilitySchema.safeParse({ available: false, until: '  August  ' });
		expect(result.success && result.data.until).toBe('August');
	});

	it('rejects a non-boolean available', () => {
		expect(availabilitySchema.safeParse({ available: 'yes', until: '' }).success).toBe(false);
	});

	it('rejects an over-long until', () => {
		const result = availabilitySchema.safeParse({ available: false, until: 'x'.repeat(41) });
		expect(result.success).toBe(false);
	});
});
