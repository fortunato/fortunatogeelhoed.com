import { describe, expect, it } from 'vitest';
import {
	INDEXED_PATHS,
	SITE_URL,
	buildRobotsTxt,
	buildSitemap,
	renderSeoHead,
	resolvePageSeo,
} from './seo';

describe('resolvePageSeo', () => {
	it('returns the tuned override for a known path', () => {
		const seo = resolvePageSeo('/about', { title: 'About', description: 'fallback' });
		expect(seo.title).toContain('About Fortunato Geelhoed');
		expect(seo.description).not.toBe('fallback');
	});

	it('falls back to page content, suffixed with the site name', () => {
		const seo = resolvePageSeo('/work', {
			title: 'Case Studies',
			description: 'Selected work.',
		});
		expect(seo.title).toBe('Case Studies | Fortunato Geelhoed');
		expect(seo.description).toBe('Selected work.');
	});

	it('uses the site default when no content is available', () => {
		const seo = resolvePageSeo('/work');
		expect(seo.title).toBe('Fortunato Geelhoed');
		expect(seo.description).toContain('Freelance');
	});
});

describe('renderSeoHead', () => {
	it('emits canonical, Open Graph, and JSON-LD for an indexed page', () => {
		const head = renderSeoHead('/', resolvePageSeo('/'));
		expect(head).toContain('<title>');
		expect(head).toContain(`<link rel="canonical" href="${SITE_URL}/">`);
		expect(head).toContain('property="og:title"');
		expect(head).toContain('application/ld+json');
		expect(head).not.toContain('noindex');
	});

	it('marks a deferred page noindex and omits canonical/structured data', () => {
		const head = renderSeoHead('/work', { title: 'Case Studies', description: 'x' });
		expect(head).toContain('content="noindex,follow"');
		expect(head).not.toContain('canonical');
		expect(head).not.toContain('application/ld+json');
	});

	it('escapes quotes in attribute values', () => {
		const head = renderSeoHead('/work', { title: 'a "quote" here', description: 'x' });
		expect(head).toContain('&quot;quote&quot;');
	});
});

describe('sitemap and robots', () => {
	it('lists exactly the indexed paths as absolute URLs', () => {
		const xml = buildSitemap();
		for (const path of INDEXED_PATHS) {
			const loc = `${SITE_URL}${path === '/' ? '/' : path}`;
			expect(xml).toContain(`<loc>${loc}</loc>`);
		}
		expect(xml).not.toContain('/services');
		expect(xml).not.toContain('/blog');
	});

	it('robots.txt allows indexing and points at the sitemap', () => {
		const robots = buildRobotsTxt();
		expect(robots).toContain('Allow: /');
		expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
	});
});
