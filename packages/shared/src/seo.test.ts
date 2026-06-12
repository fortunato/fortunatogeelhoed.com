import { describe, expect, it } from 'vitest';
import {
	INDEXED_PATHS,
	OG_DEFAULT_IMAGE_PATH,
	OG_IMAGE_PATH,
	SITE_URL,
	buildRobotsTxt,
	buildSitemap,
	isIndexedPath,
	renderArticleSeoHead,
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

	it('uses the branded default card for the social image, and the photo for Person.image', () => {
		const head = renderSeoHead('/', resolvePageSeo('/'));
		expect(head).toContain(`property="og:image" content="${SITE_URL}${OG_DEFAULT_IMAGE_PATH}"`);
		expect(head).toContain(
			`name="twitter:image" content="${SITE_URL}${OG_DEFAULT_IMAGE_PATH}"`,
		);
		// schema.org Person.image stays a portrait of the person, not the share card.
		expect(head).toContain(`"image":"${SITE_URL}${OG_IMAGE_PATH}"`);
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

describe('isIndexedPath', () => {
	it('indexes the writing section and any article under it', () => {
		expect(isIndexedPath('/writing')).toBe(true);
		expect(isIndexedPath('/writing/too-react')).toBe(true);
	});

	it('does not index unrelated or deferred paths', () => {
		expect(isIndexedPath('/work')).toBe(false);
		expect(isIndexedPath('/writingish')).toBe(false);
	});
});

describe('renderArticleSeoHead', () => {
	const input = {
		slug: 'too-react',
		title: 'Too React',
		description: 'The framework was never the hard part.',
		date: '2026-06-11',
		ogImage: '/assets/og/too-react.png',
	};

	it('emits canonical, article Open Graph, the per-article image, and BlogPosting JSON-LD', () => {
		const head = renderArticleSeoHead(input);
		expect(head).toContain(`<link rel="canonical" href="${SITE_URL}/writing/too-react">`);
		expect(head).toContain('property="og:type" content="article"');
		expect(head).toContain(`content="${SITE_URL}/assets/og/too-react.png"`);
		expect(head).toContain('"@type":"BlogPosting"');
		expect(head).toContain('"datePublished":"2026-06-11"');
		expect(head).not.toContain('noindex');
	});

	it('guards the JSON-LD against premature script termination', () => {
		const head = renderArticleSeoHead({ ...input, title: 'a </script> b' });
		expect(head).not.toContain('</script> b');
		expect(head).toContain('\\u003c/script>');
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

	it('appends extra paths after the fixed routes, deduplicated', () => {
		const xml = buildSitemap(['/writing', '/writing/too-react', '/about']);
		expect(xml).toContain(`<loc>${SITE_URL}/writing</loc>`);
		expect(xml).toContain(`<loc>${SITE_URL}/writing/too-react</loc>`);
		// /about is already a fixed indexed path, so it appears exactly once.
		expect(xml.match(new RegExp(`<loc>${SITE_URL}/about</loc>`, 'g'))).toHaveLength(1);
	});

	it('robots.txt allows indexing and points at the sitemap', () => {
		const robots = buildRobotsTxt();
		expect(robots).toContain('Allow: /');
		expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
	});
});
