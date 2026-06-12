import postsData from '@fg/content-data/posts.json';
import { type Article, articlePath } from '@fg/shared';
import { registerElements } from '@fg/shared/elements';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ContentProvider } from '../content';
import { Writing } from './Writing';

// The writing index, in a real browser. Mirrors the Vue/Angular tests so the same listing
// behaviour (published articles, newest-first, each linking to its article) is proven across all
// three. Mounts with a router and the content provider, like the page does in the real app.
beforeAll(() => registerElements());
afterEach(cleanup);

const published = (postsData as { published: Article[] }).published;

function renderWriting() {
	return render(
		<MemoryRouter>
			<ContentProvider content={{}}>
				<Writing />
			</ContentProvider>
		</MemoryRouter>,
	);
}

describe('Writing index (React)', () => {
	it('lists the published articles newest-first, each linking to its article', () => {
		renderWriting();

		const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
		expect(headings).toEqual(published.map((post) => post.title));

		for (const post of published) {
			const link = screen.getByRole('link', { name: new RegExp(post.title) });
			expect(link.getAttribute('href')).toBe(articlePath(post.slug));
		}
	});

	it('renders both published titles', () => {
		renderWriting();
		expect(screen.getByText('Too React')).toBeTruthy();
		expect(screen.getByText('Specialization Is Overrated')).toBeTruthy();
	});
});
