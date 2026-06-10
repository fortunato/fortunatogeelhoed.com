import { afterEach, describe, expect, it, vi } from 'vitest';
import { readAvailabilitySeed } from './availability-client';

// Pure parse/guard logic for the server-injected availability seed. The function reads the
// #jb-availability JSON <script> the server drops into the contact page and validates it against
// the shared schema. It runs without a real DOM by stubbing a minimal document, so it stays in
// the fast node tier; the live fetch and the framework wiring are covered elsewhere.

// A document stub exposing only what readAvailabilitySeed touches: getElementById -> textContent.
function withSeedElement(textContent: string | null): void {
	const element = textContent === null ? null : ({ textContent } as { textContent: string });
	vi.stubGlobal('document', {
		getElementById: (id: string) => (id === 'jb-availability' ? element : null),
	});
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('readAvailabilitySeed', () => {
	it('returns null when there is no document (server / prerender)', () => {
		// No document stub in place: typeof document === 'undefined'.
		expect(readAvailabilitySeed()).toBeNull();
	});

	it('returns null when the seed element is absent', () => {
		withSeedElement(null);
		expect(readAvailabilitySeed()).toBeNull();
	});

	it('returns null when the seed element is empty', () => {
		withSeedElement('');
		expect(readAvailabilitySeed()).toBeNull();
	});

	it('parses a valid available seed and applies the schema default for until', () => {
		withSeedElement(JSON.stringify({ available: true }));
		expect(readAvailabilitySeed()).toEqual({ available: true, until: '' });
	});

	it('parses a valid unavailable seed including the until window', () => {
		withSeedElement(JSON.stringify({ available: false, until: 'August 2026' }));
		expect(readAvailabilitySeed()).toEqual({ available: false, until: 'August 2026' });
	});

	it('returns null on malformed JSON rather than throwing', () => {
		withSeedElement('{ not valid json');
		expect(readAvailabilitySeed()).toBeNull();
	});

	it('returns null when the JSON does not satisfy the schema', () => {
		withSeedElement(JSON.stringify({ available: 'yes' }));
		expect(readAvailabilitySeed()).toBeNull();
	});
});
