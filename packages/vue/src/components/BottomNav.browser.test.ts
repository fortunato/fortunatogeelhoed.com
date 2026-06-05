import { registerElements } from '@fg/shared/elements';
import { cleanup, render, screen } from '@testing-library/vue';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import BottomNav from './BottomNav.vue';

// The mobile-first primary navigation, in a real browser. Mirrors the React/Angular tests so
// the same nav behaviour (destinations + active state) is proven across all three.
beforeAll(() => registerElements());
afterEach(cleanup);

const blank = { template: '<div />' };
const router = createRouter({
	history: createMemoryHistory(),
	routes: [
		{ path: '/', component: blank },
		{ path: '/timeline', component: blank },
		{ path: '/contact', component: blank },
	],
});

async function renderNav(path = '/') {
	await router.push(path);
	await router.isReady();
	return render(BottomNav, { global: { plugins: [router] } });
}

const DESTINATIONS: [string, string][] = [
	['Home', '/'],
	['Career', '/timeline'],
	['Contact', '/contact'],
];

describe('BottomNav (Vue)', () => {
	it('exposes the three primary destinations', async () => {
		await renderNav();
		for (const [label, path] of DESTINATIONS) {
			expect(screen.getByRole('link', { name: label }).getAttribute('href')).toBe(path);
		}
	});

	it('marks the current destination as active', async () => {
		await renderNav('/timeline');
		expect(screen.getByRole('link', { name: 'Career' }).getAttribute('aria-current')).toBe(
			'page',
		);
		expect(screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBeNull();
	});
});
