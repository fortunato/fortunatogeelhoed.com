import contentData from '@fg/content-data/data.json';
import postsData from '@fg/content-data/posts.json';
import { type Article, type ContentItem, articlePath } from '@fg/shared';
import { registerElements } from '@fg/shared/elements';
import { cleanup, render, screen } from '@testing-library/vue';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { setContent } from '../composables/useContent';
import Writing from './Writing.vue';

// The writing index, in a real browser. Mirrors the React/Angular tests so the same listing
// behaviour (published articles, newest-first, each linking to its article) is proven across all
// three. Mounts with a router and the content provider, like the page does in the real app.
beforeAll(() => {
	registerElements();
	setContent(contentData as Record<string, ContentItem>);
});
afterEach(cleanup);

const published = (postsData as { published: Article[] }).published;

async function renderWriting() {
	const router = createRouter({
		history: createMemoryHistory(),
		routes: [{ path: '/:rest(.*)*', component: { template: '<div />' } }],
	});
	router.push('/writing');
	await router.isReady();
	return render(Writing, { global: { plugins: [router] } });
}

describe('Writing index (Vue)', () => {
	it('lists the published articles newest-first, each linking to its article', async () => {
		await renderWriting();

		const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
		expect(headings).toEqual(published.map((post) => post.title));

		for (const post of published) {
			const link = screen.getByRole('link', { name: new RegExp(post.title) });
			expect(link.getAttribute('href')).toBe(articlePath(post.slug));
		}
	});

	it('renders both published titles', async () => {
		await renderWriting();
		expect(screen.getByText('Too React')).toBeTruthy();
		expect(screen.getByText('Specialization Is Overrated')).toBeTruthy();
	});
});
