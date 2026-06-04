import { describe, expect, it } from 'vitest';
import { getHomeContent } from './home';

describe('homepage content', () => {
	const home = getHomeContent();

	it('has hero copy', () => {
		expect(home.hero.name).toBeTruthy();
		expect(home.hero.statement).toBeTruthy();
	});

	it('offers exactly four services', () => {
		expect(home.services).toHaveLength(4);
		for (const service of home.services) {
			expect(service.title).toBeTruthy();
			expect(service.description).toBeTruthy();
		}
	});

	it('has at least three proof points', () => {
		expect(home.proof.length).toBeGreaterThanOrEqual(3);
	});

	it('links every writing teaser to a real route', () => {
		expect(home.writing.length).toBeGreaterThan(0);
		for (const item of home.writing) {
			expect(item.href.startsWith('/')).toBe(true);
		}
	});

	it('sends the call to action to the contact page', () => {
		expect(home.cta.href).toBe('/contact');
	});
});
