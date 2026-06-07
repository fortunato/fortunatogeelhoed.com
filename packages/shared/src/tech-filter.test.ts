import { describe, expect, it } from 'vitest';
import {
	entryMatchesTech,
	formatTechQuery,
	parseTechQuery,
	techNameFromSlug,
	techSlug,
} from './tech-filter';
import type { TimelineEntry } from './types/timeline';

function entry(tech: TimelineEntry['tech']): TimelineEntry {
	return {
		id: 'x',
		era: 'era',
		years: '2020',
		startYear: 2020,
		endYear: 'present',
		client: 'Client',
		role: 'Role',
		type: 'independent',
		tech,
	};
}

describe('techSlug', () => {
	it('lowercases and collapses non-alphanumerics, trimming edges', () => {
		expect(techSlug('React')).toBe('react');
		expect(techSlug('Next.js')).toBe('next-js');
		expect(techSlug('TypeScript/Flow')).toBe('typescript-flow');
		expect(techSlug('SCSS Modules')).toBe('scss-modules');
		expect(techSlug('Ext JS')).toBe('ext-js');
		expect(techSlug('Prototype.js')).toBe('prototype-js');
	});
});

describe('slug round-trip', () => {
	it('maps awkward registry names back to their display name', () => {
		for (const name of [
			'React',
			'Next.js',
			'TypeScript/Flow',
			'SCSS Modules',
			'lightweight-charts',
		]) {
			expect(techNameFromSlug(techSlug(name))).toBe(name);
		}
	});

	it('returns undefined for unknown slugs', () => {
		expect(techNameFromSlug('not-a-real-tech')).toBeUndefined();
	});
});

describe('entryMatchesTech (AND)', () => {
	const row = entry({ frontend: ['React', 'Redux'], backend: ['Node.js'] });

	it('matches everything when no filters are active', () => {
		expect(entryMatchesTech(row, new Set())).toBe(true);
	});

	it('matches a single active tech the row carries (in any lane)', () => {
		expect(entryMatchesTech(row, new Set(['React']))).toBe(true);
		expect(entryMatchesTech(row, new Set(['Node.js']))).toBe(true);
	});

	it('requires every active tech to be present (AND, across lanes)', () => {
		expect(entryMatchesTech(row, new Set(['React', 'Node.js']))).toBe(true);
		expect(entryMatchesTech(row, new Set(['React', 'Vue']))).toBe(false);
	});

	it('does not match a tech the row lacks', () => {
		expect(entryMatchesTech(row, new Set(['Angular']))).toBe(false);
	});
});

describe('parse/format symmetry', () => {
	it('formats sorted, comma-joined slugs', () => {
		expect(formatTechQuery(new Set(['React', 'Docker']))).toBe('docker,react');
		expect(formatTechQuery(new Set())).toBe('');
	});

	it('round-trips a set of display names through the query string', () => {
		const active = new Set(['React', 'Next.js']);
		expect(parseTechQuery(formatTechQuery(active))).toEqual(active);
	});

	it('drops unknown and blank tokens on parse', () => {
		expect(parseTechQuery('react,,not-real, docker ')).toEqual(new Set(['React', 'Docker']));
		expect(parseTechQuery(null)).toEqual(new Set());
		expect(parseTechQuery('')).toEqual(new Set());
	});
});
