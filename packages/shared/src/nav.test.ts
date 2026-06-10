import { describe, expect, it } from 'vitest';
import { NAV_ITEMS } from './nav';

describe('NAV_ITEMS', () => {
	it('lists at least one destination, each with a label, path and icon', () => {
		expect(NAV_ITEMS.length).toBeGreaterThan(0);
		for (const item of NAV_ITEMS) {
			expect(item.label).toBeTypeOf('string');
			expect(item.label.length).toBeGreaterThan(0);
			expect(item.icon).toBeTypeOf('string');
			expect(item.icon.length).toBeGreaterThan(0);
			expect(item.path).toBeTypeOf('string');
		}
	});

	it('uses absolute, root-relative paths', () => {
		for (const item of NAV_ITEMS) {
			expect(item.path.startsWith('/')).toBe(true);
		}
	});

	it('keeps every path unique', () => {
		const paths = NAV_ITEMS.map((item) => item.path);
		expect(new Set(paths).size).toBe(paths.length);
	});

	it('keeps every label unique', () => {
		const labels = NAV_ITEMS.map((item) => item.label);
		expect(new Set(labels).size).toBe(labels.length);
	});

	it('exposes Home at the site root', () => {
		const home = NAV_ITEMS.find((item) => item.path === '/');
		expect(home?.label).toBe('Home');
	});
});
