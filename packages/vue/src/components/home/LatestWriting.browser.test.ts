import homeData from '@fg/content-data/home.json';
import type { HomeContent } from '@fg/shared';
import { registerElements } from '@fg/shared/elements';
import { cleanup, render, screen } from '@testing-library/vue';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import LatestWriting from './LatestWriting.vue';

// The homepage "Latest writing" teasers, in a real browser. Mirrors the React/Angular tests so
// the teaser links to article URLs are proven identical across all three.
beforeAll(() => registerElements());
afterEach(cleanup);

const home = homeData as HomeContent;
const router = createRouter({
	history: createMemoryHistory(),
	routes: [{ path: '/:rest(.*)*', component: { template: '<div />' } }],
});

describe('LatestWriting (Vue)', () => {
	it('links each teaser to its /writing/<slug> article', async () => {
		router.push('/');
		await router.isReady();
		render(LatestWriting, {
			props: { writing: home.writing, copy: home.sections.writing },
			global: { plugins: [router] },
		});
		for (const post of home.writing) {
			const link = screen.getByRole('link', { name: new RegExp(post.title) });
			expect(link.getAttribute('href')).toBe(post.href);
			expect(post.href).toMatch(/^\/writing\/[\w-]+$/);
		}
	});
});
