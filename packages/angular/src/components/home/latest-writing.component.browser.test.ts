import { provideRouter } from '@angular/router';
import homeData from '@fg/content-data/home.json';
import type { HomeContent } from '@fg/shared';
import { registerElements } from '@fg/shared/elements';
import { render, screen } from '@testing-library/angular';
import { beforeAll, describe, expect, it } from 'vitest';
import { LatestWritingComponent } from './latest-writing.component';

// The homepage "Latest writing" teasers, in a real browser. Mirrors the React/Vue tests so
// the teaser links to article URLs are proven identical across all three.
beforeAll(() => registerElements());

const home = homeData as HomeContent;

describe('LatestWritingComponent (Angular)', () => {
	it('links each teaser to its /writing/<slug> article', async () => {
		await render(LatestWritingComponent, {
			providers: [provideRouter([])],
			inputs: { writing: home.writing, copy: home.sections.writing },
		});
		for (const post of home.writing) {
			const link = screen.getByRole('link', { name: new RegExp(post.title) });
			expect(link.getAttribute('href')).toBe(post.href);
			expect(post.href).toMatch(/^\/writing\/[\w-]+$/);
		}
	});
});
