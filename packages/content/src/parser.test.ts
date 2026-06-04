import { describe, expect, it } from 'vitest';
import { parseContent } from './parser';

describe('parseContent', () => {
	it('splits frontmatter metadata from the body', () => {
		const raw = [
			'---',
			'title: About',
			'slug: about',
			'type: page',
			'---',
			'',
			'Body **text**.',
		].join('\n');
		const item = parseContent(raw);
		expect(item.title).toBe('About');
		expect(item.slug).toBe('about');
		expect(item.type).toBe('page');
		expect(item.body).toBe('Body **text**.');
	});

	it('applies sensible defaults when frontmatter is missing', () => {
		const item = parseContent('Just a body, no frontmatter.');
		expect(item.title).toBe('');
		expect(item.slug).toBe('');
		expect(item.type).toBe('page');
		expect(item.body).toBe('Just a body, no frontmatter.');
	});

	it('trims surrounding whitespace from the body', () => {
		const raw = ['---', 'title: T', '---', '', '   spaced   ', ''].join('\n');
		expect(parseContent(raw).body).toBe('spaced');
	});
});
