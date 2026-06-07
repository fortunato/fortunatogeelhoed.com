import { describe, expect, it } from 'vitest';
import { contactSchema } from './contact';

// The contact rules are the single source of truth shared by every framework's form
// and the API, so client and server can never drift. These assertions pin that contract.
describe('contactSchema', () => {
	const valid = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello there.' };

	it('accepts a well-formed submission', () => {
		const result = contactSchema.safeParse(valid);
		expect(result.success).toBe(true);
	});

	it('rejects a blank name', () => {
		const result = contactSchema.safeParse({ ...valid, name: '   ' });
		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe('Name is required');
	});

	it('rejects a malformed email', () => {
		const result = contactSchema.safeParse({ ...valid, email: 'not-an-email' });
		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe('Enter a valid email');
	});

	it('rejects an empty message', () => {
		const result = contactSchema.safeParse({ ...valid, message: '' });
		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe('Message is required');
	});

	it('trims surrounding whitespace on accepted values', () => {
		const result = contactSchema.safeParse({ ...valid, name: '  Ada  ' });
		expect(result.success && result.data.name).toBe('Ada');
	});

	it('rejects an over-long name', () => {
		const result = contactSchema.safeParse({ ...valid, name: 'a'.repeat(101) });
		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe('Name is too long');
	});

	it('rejects an over-long email', () => {
		const result = contactSchema.safeParse({ ...valid, email: `${'a'.repeat(250)}@b.com` });
		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe('Email is too long');
	});

	it('rejects an over-long message', () => {
		const result = contactSchema.safeParse({ ...valid, message: 'm'.repeat(5001) });
		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe('Message is too long');
	});
});
