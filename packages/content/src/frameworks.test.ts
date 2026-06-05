import type { ExposureIntensity } from '@fg/shared';
import { describe, expect, it } from 'vitest';
import { getBackendFrameworks } from './backend-frameworks';
import { getFrontendFrameworks } from './frontend-frameworks';

const INTENSITIES: ExposureIntensity[] = ['professional', 'occasional', 'brief'];

describe('framework exposure', () => {
	const frontend = getFrontendFrameworks();
	const backend = getBackendFrameworks();
	const all = [...frontend, ...backend];

	it('covers both frontend and backend frameworks', () => {
		expect(frontend.length).toBeGreaterThan(0);
		expect(backend.length).toBeGreaterThan(0);
	});

	it('uses only known intensity levels, across at least three', () => {
		const levels = new Set(all.map((f) => f.intensity));
		expect(levels.size).toBeGreaterThanOrEqual(3);
		for (const span of all) {
			expect(INTENSITIES).toContain(span.intensity);
			expect(span.endYear === 'present' || span.endYear >= span.startYear).toBe(true);
		}
	});

	it('keeps frontend and backend as distinct lists', () => {
		expect(frontend.some((f) => f.framework === 'React')).toBe(true);
		expect(backend.some((f) => f.framework === 'NestJS')).toBe(true);
	});
});
