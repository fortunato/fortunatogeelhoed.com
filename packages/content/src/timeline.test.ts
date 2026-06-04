import type { EmploymentType, ExposureIntensity, Lane } from '@fg/shared';
import { describe, expect, it } from 'vitest';
import { getTimeline } from './timeline';

const LANES: Lane[] = ['frontend', 'backend', 'ci-cd', 'ai-llm', 'database'];
const EMPLOYMENT: EmploymentType[] = ['employee', 'contractor', 'freelance', 'self-employed'];
const INTENSITIES: ExposureIntensity[] = ['professional', 'occasional', 'brief'];

describe('career timeline', () => {
	const { entries, frameworks } = getTimeline();

	it('spans at least 25 years from 2000 to the present', () => {
		const earliest = Math.min(...entries.map((e) => e.startYear));
		expect(earliest).toBeLessThanOrEqual(2001);
		expect(entries.some((e) => e.endYear === 'present')).toBe(true);
	});

	it('has unique ids and valid employment types', () => {
		const ids = entries.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const entry of entries) {
			expect(EMPLOYMENT).toContain(entry.employmentType);
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

	it('includes at least one side project', () => {
		expect(entries.some((e) => e.isSideProject)).toBe(true);
	});

	it('densifies the AI/LLM lane toward recent years', () => {
		const withAi = entries.filter((e) => e.tech['ai-llm']?.length);
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
