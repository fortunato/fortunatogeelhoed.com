import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
	type Article,
	type ContentItem,
	articlePathsFromPosts,
	renderArticleSeoHead,
	renderSeoHead,
	resolvePageSeo,
	routes,
} from '@fg/shared';
import contentData from '../content/data.json';
import postsData from '../content/posts.json';

// Anchor in the Vite-built shell that we swap for the per-route SEO head block.
const TITLE_ANCHOR = '<title>FORTUNATO.GEELHOED</title>';

const distDir = resolve(import.meta.dirname, '../../dist/react');
const viteOutDir = resolve(distDir);

async function prerender() {
	// Read the Vite-built index.html as the shell template
	const template = await readFile(resolve(viteOutDir, 'index.html'), 'utf-8');
	// The SSR bundle is a build artifact with no declarations; widen the specifier so
	// type-checking neither resolves it nor requires dist/ to exist, then assert the
	// one export this script uses.
	const { render } = (await import('../../dist/react-ssr/entry-server.js' as string)) as {
		render: (url: string, content?: Record<string, ContentItem>) => Promise<string>;
	};

	if (!template.includes(TITLE_ANCHOR)) {
		throw new Error('prerender: title anchor not found in shell — SEO head cannot be injected');
	}

	const content = contentData as Record<string, ContentItem>;

	for (const route of routes) {
		const appHtml = await render(route.path, content);
		const page = route.contentSlug ? content[route.contentSlug] : undefined;
		const seo = resolvePageSeo(route.path, {
			title: page?.title,
			description: page?.description,
		});
		const html = template
			.replace(TITLE_ANCHOR, renderSeoHead(route.path, seo))
			.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`);

		const filePath =
			route.path === '/'
				? resolve(distDir, 'index.html')
				: resolve(distDir, `${route.path.slice(1)}/index.html`);

		await mkdir(dirname(filePath), { recursive: true });
		await writeFile(filePath, html);
		console.log(`  ✓ ${route.path} → ${filePath}`);
	}

	// Each published article gets its own static page under /writing/<slug>, with the full
	// article head (canonical, Open Graph article tags with the per-article image, BlogPosting
	// JSON-LD). React is the canonical indexed render, so this is where the rich head lives.
	const published = (postsData as { published: Article[] }).published;
	const articleBySlug = new Map(published.map((post) => [post.slug, post]));

	for (const path of articlePathsFromPosts(published)) {
		const slug = path.slice(path.lastIndexOf('/') + 1);
		const article = articleBySlug.get(slug);
		const appHtml = await render(path, content);
		const head = article
			? renderArticleSeoHead({
					slug: article.slug,
					title: article.title,
					description: article.description ?? '',
					date: article.date ?? '',
					ogImage: article.ogImage,
				})
			: // An article path with no matching record should not occur (the loop iterates the
				// published list), but fall back to the route head rather than emit a broken page.
				renderSeoHead(path, resolvePageSeo(path));
		const html = template
			.replace(TITLE_ANCHOR, head)
			.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`);

		const filePath = resolve(distDir, `${path.slice(1)}/index.html`);
		await mkdir(dirname(filePath), { recursive: true });
		await writeFile(filePath, html);
		console.log(`  ✓ ${path} → ${filePath}`);
	}

	const total = routes.length + published.length;
	console.log(`\nPre-rendered ${total} routes to ${distDir}`);
}

prerender();
