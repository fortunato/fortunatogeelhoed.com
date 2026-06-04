import type { EmploymentType, ExposureIntensity, Lane } from '@fg/shared';
import { describe, expect, it } from 'vitest';
import { getTimeline } from './timeline';

const LANES: Lane[] = ['frontend', 'backend', 'cicd', 'ai'];
const EMPLOYMENT: EmploymentType[] = ['employee', 'independent', 'side-project'];
const INTENSITIES: ExposureIntensity[] = ['professional', 'occasional', 'brief'];

describe('career timeline', () => {
	const { entries, frameworks } = getTimeline();

	it('spans at least 25 years from 2000 to the present', () => {
		const earliest = Math.min(...entries.map((e) => e.startYear));
		expect(earliest).toBeLessThanOrEqual(2001);
		expect(entries.some((e) => e.endYear === 'present')).toBe(true);
	});

	it('has unique ids, eras, real roles and valid types', () => {
		const ids = entries.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const entry of entries) {
			expect(entry.era).toBeTruthy();
			expect(entry.role).toBeTruthy();
			expect(entry.client).toBeTruthy();
			expect(entry.years).toBeTruthy();
			expect(EMPLOYMENT).toContain(entry.type);
			expect(entry.endYear === 'present' || entry.endYear >= entry.startYear).toBe(true);
		}
	});

	it('only uses known lanes for tech groupings', () => {
		for (const entry of entries) {
			for (const lane of Object.keys(entry.tech)) {
				expect(LANES).toContain(lane as Lane);
			}
		}
	});

	it('places side projects chronologically, not all at the end', () => {
		const sideProjects = entries.filter((e) => e.type === 'side-project');
		expect(sideProjects.length).toBeGreaterThanOrEqual(2);
		// the timeline does not end on a side project
		expect(entries.at(-1)?.type).not.toBe('side-project');
	});

	it('includes the py-market-structure project', () => {
		expect(entries.some((e) => e.id === 'py-market-structure')).toBe(true);
	});

	it('densifies the AI lane toward recent years', () => {
		const withAi = entries.filter((e) => e.tech.ai?.length);
		expect(withAi.every((e) => e.startYear >= 2018)).toBe(true);
		expect(withAi.length).toBeGreaterThanOrEqual(3);
	});

	it('describes framework exposure across at least three intensity levels', () => {
		const levels = new Set(frameworks.map((f) => f.intensity));
		expect(levels.size).toBeGreaterThanOrEqual(3);
		for (const span of frameworks) {
			expect(INTENSITIES).toContain(span.intensity);
		}
	});
});
