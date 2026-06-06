import { describe, expect, it } from 'vitest';
import { toParagraphs } from './text';

describe('toParagraphs', () => {
	it('splits a body on blank lines', () => {
		expect(toParagraphs('First paragraph.\n\nSecond paragraph.')).toEqual([
			'First paragraph.',
			'Second paragraph.',
		]);
	});

	it('treats runs of blank lines as a single break and trims each paragraph', () => {
		expect(toParagraphs('  One  \n\n\n\n  Two  ')).toEqual(['One', 'Two']);
	});

	it('drops empty segments and returns [] for blank input', () => {
		expect(toParagraphs('\n\n   \n\n')).toEqual([]);
		expect(toParagraphs('')).toEqual([]);
	});

	it('keeps a single paragraph intact (no false splits on single newlines)', () => {
		expect(toParagraphs('Line one\nstill the same paragraph')).toEqual([
			'Line one\nstill the same paragraph',
		]);
	});
});
