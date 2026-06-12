import { provideRouter } from '@angular/router';
import postsData from '@fg/content-data/posts.json';
import { type Article, articlePath } from '@fg/shared';
import { registerElements } from '@fg/shared/elements';
import { render, screen } from '@testing-library/angular';
import { beforeAll, describe, expect, it } from 'vitest';
import { WritingComponent } from './writing.component';

// The writing index, in a real browser. Mirrors the React/Vue tests so the same listing
// behaviour (published articles, newest-first, each linking to its article) is proven across all
// three. Mounts with a router and the root content service, like the page does in the real app.
beforeAll(() => registerElements());

const published = (postsData as { published: Article[] }).published;

describe('Writing index (Angular)', () => {
	it('lists the published articles newest-first, each linking to its article', async () => {
		await render(WritingComponent, { providers: [provideRouter([])] });

		const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
		expect(headings).toEqual(published.map((post) => post.title));

		for (const post of published) {
			const link = screen.getByRole('link', { name: new RegExp(post.title) });
			expect(link.getAttribute('href')).toBe(articlePath(post.slug));
		}
	});

	it('renders both published titles', async () => {
		await render(WritingComponent, { providers: [provideRouter([])] });
		expect(screen.getByText('Too React')).toBeTruthy();
		expect(screen.getByText('Specialization Is Overrated')).toBeTruthy();
	});
});
