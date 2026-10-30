import { type APIRequestContext, expect, test } from '@playwright/test';
import postsData from '../../packages/content/posts.json' with { type: 'json' };
import { articlePath } from '../../packages/shared/src/articles';
import { INDEXED_PATHS, SITE_URL } from '../../packages/shared/src/seo';

// The <head> each build ships in its prerendered HTML, read straight from the production server
// without a browser, so this is exactly what a crawler or a link unfurler receives. React builds
// its head as a string at prerender time; Vue sets an article's head through useHead() during
// vite-ssg, and Angular through its Meta/Title services during SSR. A dependency bump on either
// side can drop those tags from the static output without failing the build, so assert the
// served HTML rather than the code that produces it.
const FRAMEWORKS = ['react', 'vue', 'angular'] as const;
const posts = (
	postsData as {
		published: { slug: string; title: string; description?: string; ogImage: string }[];
	}
).published;

type Head = {
	title?: string;
	canonical?: string;
	meta: Map<string, string>;
};

// Reads the attributes of every <meta> in the document head by property or name, which is all the
// tags here use. A regex is enough: the markup is our own prerendered output, not arbitrary HTML.
function parseHead(html: string): Head {
	const head = html.slice(0, html.indexOf('</head>'));
	const attr = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
	const meta = new Map<string, string>();
	for (const [tag] of head.matchAll(/<meta\s[^>]*>/g)) {
		const key = attr(tag, 'property') ?? attr(tag, 'name');
		const content = attr(tag, 'content');
		if (key && content !== undefined) meta.set(key, content);
	}
	const canonical = [...head.matchAll(/<link\s[^>]*>/g)]
		.map(([tag]) => tag)
		.find((tag) => attr(tag, 'rel') === 'canonical');
	return {
		title: head.match(/<title>([^<]*)<\/title>/)?.[1],
		canonical: canonical && attr(canonical, 'href'),
		meta,
	};
}

// Attribute values come back HTML-escaped; the expectations are plain text.
const decodeEntities = (value: string) =>
	value
		.replaceAll('&quot;', '"')
		.replaceAll('&#39;', "'")
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replaceAll('&amp;', '&');

async function fetchHead(request: APIRequestContext, path: string, framework?: string) {
	const res = await request.get(path, {
		headers: framework ? { cookie: `framework=${framework}` } : {},
	});
	expect(res.status(), `${path} (${framework ?? 'no cookie'})`).toBe(200);
	const head = parseHead(await res.text());
	return {
		title: head.title && decodeEntities(head.title),
		canonical: head.canonical,
		meta: (key: string) => {
			const value = head.meta.get(key);
			return value === undefined ? undefined : decodeEntities(value);
		},
	};
}

test.describe('article head', () => {
	for (const post of posts) {
		for (const framework of FRAMEWORKS) {
			test(`${framework} ships the head for ${post.slug}`, async ({ request }) => {
				const url = `${SITE_URL}${articlePath(post.slug)}`;
				const head = await fetchHead(request, articlePath(post.slug), framework);
				expect(head.title).toBe(post.title);
				expect(head.canonical).toBe(url);
				expect(head.meta('description')).toBe(post.description ?? '');
				expect(head.meta('og:type')).toBe('article');
				expect(head.meta('og:title')).toBe(post.title);
				expect(head.meta('og:url')).toBe(url);
				expect(head.meta('og:image')).toBe(`${SITE_URL}${post.ogImage}`);
				expect(head.meta('twitter:card')).toBe('summary_large_image');
			});
		}
	}
});

// Crawlers send no framework cookie and get the React build, which is the one that carries the
// page-level SEO head for the fixed routes.
test.describe('crawler head', () => {
	for (const path of [...INDEXED_PATHS, '/writing']) {
		test(`the default build ships the SEO head for ${path}`, async ({ request }) => {
			const head = await fetchHead(request, path);
			expect(head.title).toBeTruthy();
			expect(head.canonical).toBe(`${SITE_URL}${path === '/' ? '/' : path}`);
			expect(head.meta('description')).toBeTruthy();
			expect(head.meta('og:title')).toBeTruthy();
			expect(head.meta('og:url')).toBe(head.canonical);
			expect(head.meta('og:image')).toMatch(new RegExp(`^${SITE_URL}/`));
		});
	}
});
