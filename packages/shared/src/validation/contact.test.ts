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
});
