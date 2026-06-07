import type { EmploymentType, Lane } from '@fg/shared';
import { DOMAINS } from '@fg/shared';
import { describe, expect, it } from 'vitest';
import { getTimeline } from './timeline';

const LANES: Lane[] = ['frontend', 'backend', 'cicd', 'ai'];
const EMPLOYMENT: EmploymentType[] = ['employee', 'independent', 'side-project'];

describe('career timeline', () => {
	const { entries } = getTimeline();

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
		expect(entries.some((e) => e.id === 'pymarket-structure')).toBe(true);
	});

	it('only tags entries with known domains', () => {
		for (const entry of entries) {
			for (const domain of entry.domains ?? []) {
				expect(DOMAINS).toContain(domain);
			}
		}
	});

	it('marks the agency roles as agency engagements', () => {
		const agencies = entries.filter((e) => e.agency);
		expect(agencies.length).toBeGreaterThanOrEqual(2);
		expect(entries.find((e) => e.id === 'deloitte-nl')?.agency).toBe(true);
	});

	it('links py-market-structure to a write-up and its source', () => {
		const entry = entries.find((e) => e.id === 'pymarket-structure');
		expect(entry?.links?.length).toBeGreaterThanOrEqual(2);
		expect(entry?.links?.some((l) => /github\.com/.test(l.href))).toBe(true);
	});

	it('includes the Neurofeedback IJburg freelance project', () => {
		const entry = entries.find((e) => e.id === 'neurofeedback-ijburg');
		expect(entry).toBeDefined();
		expect(entry?.tech.frontend).toContain('Nuxt');
	});

	it('records Symfony at Gemeente Amsterdam', () => {
		const amsterdam = entries.find((e) => e.id === 'amsterdam');
		expect(amsterdam?.tech.backend).toContain('Symfony');
	});

	it('densifies the AI lane toward recent years', () => {
		const withAi = entries.filter((e) => e.tech.ai?.length);
		expect(withAi.every((e) => e.startYear >= 2018)).toBe(true);
		expect(withAi.length).toBeGreaterThanOrEqual(3);
	});
});
