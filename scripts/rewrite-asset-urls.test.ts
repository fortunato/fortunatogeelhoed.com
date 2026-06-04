import { describe, expect, it } from 'vitest';
import { rewriteStylesheetLink } from './rewrite-asset-urls';

describe('rewriteStylesheetLink', () => {
	it('rewrites the unhashed stylesheet link to the hashed filename', () => {
		const html = '<link rel="stylesheet" href="/assets/styles.css">';
		expect(rewriteStylesheetLink(html, 'styles.abc123.css')).toBe(
			'<link rel="stylesheet" href="/assets/styles.abc123.css">',
		);
	});

	it('rewrites every occurrence', () => {
		const html = '<link href="/assets/styles.css"><link href="/assets/styles.css">';
		const out = rewriteStylesheetLink(html, 'styles.h.css');
		expect(out).not.toContain('/assets/styles.css"');
		expect(out.match(/styles\.h\.css/g)).toHaveLength(2);
	});

	it('leaves html without the unhashed link untouched', () => {
		const html = '<link href="/assets/other.css">';
		expect(rewriteStylesheetLink(html, 'styles.h.css')).toBe(html);
	});
});
