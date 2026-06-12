import homeData from '@fg/content-data/home.json';
import type { HomeContent } from '@fg/shared';
import { registerElements } from '@fg/shared/elements';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { LatestWriting } from './LatestWriting';

// The homepage "Latest writing" teasers, in a real browser. Mirrors the Vue/Angular tests so
// the teaser links to article URLs are proven identical across all three.
beforeAll(() => registerElements());
afterEach(cleanup);

const home = homeData as HomeContent;

describe('LatestWriting (React)', () => {
	it('links each teaser to its /writing/<slug> article', () => {
		render(
			<MemoryRouter>
				<LatestWriting writing={home.writing} copy={home.sections.writing} />
			</MemoryRouter>,
		);
		for (const post of home.writing) {
			const link = screen.getByRole('link', { name: new RegExp(post.title) });
			expect(link.getAttribute('href')).toBe(post.href);
			expect(post.href).toMatch(/^\/writing\/[\w-]+$/);
		}
	});
});
