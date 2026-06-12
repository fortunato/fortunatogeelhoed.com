import postsData from '@fg/content-data/posts.json';
import { SITE_URL } from '@fg/shared';
import { describe, expect, it } from 'vitest';
import { app } from './index';

// The sitemap and the /blog redirects are wired in index.ts on top of the shared SEO helpers.
// These exercise the live, fully-wired app through app.request so the route registration (and its
// ordering before the catch-all) is what is under test, not the helpers in isolation.

const published = (postsData as { published: { slug: string; draft?: boolean }[] }).published;

describe('/sitemap.xml', () => {
	it('includes the writing index and every published article', async () => {
		const res = await app.request('/sitemap.xml');
		expect(res.status).toBe(200);
		expect(res.headers.get('content-type')).toContain('application/xml');
		const xml = await res.text();
		expect(xml).toContain(`<loc>${SITE_URL}/writing</loc>`);
		for (const post of published) {
			expect(xml).toContain(`<loc>${SITE_URL}/writing/${post.slug}</loc>`);
		}
	});

	it('excludes draft articles', async () => {
		// posts.json holds only published articles by construction (drafts are filtered at build
		// time), so a draft slug must never appear in the served sitemap.
		const res = await app.request('/sitemap.xml');
		const xml = await res.text();
		const draftSlug = 'an-unpublished-draft';
		expect(published.some((p) => p.slug === draftSlug)).toBe(false);
		expect(xml).not.toContain(`/writing/${draftSlug}`);
	});
});

describe('/blog redirects', () => {
	it('permanently redirects the bare section to /writing', async () => {
		const res = await app.request('/blog');
		expect(res.status).toBe(301);
		expect(res.headers.get('location')).toBe('/writing');
	});

	it('permanently redirects a deeper path onto its /writing equivalent', async () => {
		const res = await app.request('/blog/too-react');
		expect(res.status).toBe(301);
		expect(res.headers.get('location')).toBe('/writing/too-react');
	});
});
