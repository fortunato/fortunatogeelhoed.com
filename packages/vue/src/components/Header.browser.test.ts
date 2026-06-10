import { registerElements } from '@fg/shared/elements';
import { cleanup, render, screen } from '@testing-library/vue';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import Header from './Header.vue';

// Example Vue component test, in a real browser. Mirrors the React Header test so the
// cross-framework parity is provable at the behaviour level, not just visually. Use this
// as the pattern for future Vue components.
const router = createRouter({
	history: createMemoryHistory(),
	routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
});

beforeAll(async () => {
	registerElements();
	router.push('/');
	await router.isReady();
});
afterEach(cleanup);

function renderHeader() {
	return render(Header, { global: { plugins: [router] } });
}

describe('Header (Vue)', () => {
	it('renders the primary navigation links', () => {
		renderHeader();
		const destinations: [string, string][] = [
			['Home', '/'],
			['Career', '/career'],
			['Contact', '/contact'],
		];
		for (const [label, path] of destinations) {
			expect(screen.getByText(label).getAttribute('href')).toBe(path);
		}
	});

	it('links each framework switch to its switch endpoint', () => {
		renderHeader();
		expect(screen.getByText('react').getAttribute('href')).toBe('/__switch?to=react');
		expect(screen.getByText('angular').getAttribute('href')).toBe('/__switch?to=angular');
	});

	it('embeds the shared theme-toggle custom element', () => {
		const { container } = renderHeader();
		expect(container.querySelector('jb-theme-toggle')).toBeTruthy();
	});
});
