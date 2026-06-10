import { describe, expect, it } from 'vitest';
import { isExternalHref } from './url';

describe('isExternalHref', () => {
	it('treats absolute http(s) URLs as external', () => {
		expect(isExternalHref('https://example.com')).toBe(true);
		expect(isExternalHref('http://example.com/path')).toBe(true);
	});

	it('is case-insensitive on the scheme', () => {
		expect(isExternalHref('HTTPS://example.com')).toBe(true);
		expect(isExternalHref('HtTp://example.com')).toBe(true);
	});

	it('treats internal routes and anchors as not external', () => {
		expect(isExternalHref('/about')).toBe(false);
		expect(isExternalHref('about')).toBe(false);
		expect(isExternalHref('#section')).toBe(false);
		expect(isExternalHref('./relative')).toBe(false);
	});

	it('does not classify other schemes as external http(s)', () => {
		// These are not router-internal, but they are not the absolute-http case this guards.
		expect(isExternalHref('mailto:info@example.com')).toBe(false);
		expect(isExternalHref('tel:+34123456789')).toBe(false);
	});

	it('does not treat a protocol-relative URL as an http(s) match', () => {
		// `//host` inherits the page scheme; it is not matched by the http(s) prefix test.
		expect(isExternalHref('//example.com/path')).toBe(false);
	});

	it('only matches the scheme at the start of the string', () => {
		expect(isExternalHref('/redirect?to=https://example.com')).toBe(false);
	});
});
