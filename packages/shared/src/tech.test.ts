import { describe, expect, it } from 'vitest';
import { TECH_REGISTRY, techVisual } from './tech';

describe('techVisual', () => {
	it('returns the registry entry for a known tech, with brand and glyph', () => {
		const react = techVisual('React');
		expect(react).toEqual(TECH_REGISTRY.React);
		expect(react.brand).toMatch(/^#[0-9A-Fa-f]{3,8}$/);
		expect(react.icon).toBe('react');
	});

	it('returns a registry entry with no glyph for a glyph-less tech', () => {
		// AngularJS is in the registry as a brand-tinted text pill (no sprite icon).
		const entry = techVisual('AngularJS');
		expect(entry.brand).toBe('#b52e31');
		expect(entry.icon).toBeUndefined();
	});

	it('falls back to a neutral grey for an unknown tech', () => {
		expect(techVisual('Definitely Not A Real Tech')).toEqual({ brand: '#888888' });
	});

	it('re-exports the registry it reads from', () => {
		expect(TECH_REGISTRY).toBeTypeOf('object');
		expect(Object.keys(TECH_REGISTRY).length).toBeGreaterThan(0);
	});
});
