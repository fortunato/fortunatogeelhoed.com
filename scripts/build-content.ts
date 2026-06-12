import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
	getBackendFrameworks,
	getFrontendFrameworks,
	getHomeContent,
	getPage,
	getTimeline,
	getTimelinePage,
	listPosts,
} from '@fg/content';
import { OG_DEFAULT_IMAGE_PATH, articlePath, routes } from '@fg/shared';
import type { Article, ContentItem, WritingTeaserItem } from '@fg/shared';

const contentDir = resolve(import.meta.dirname, '../packages/content');
const ogDir = resolve(import.meta.dirname, '../static/og');

// Number of articles teased on the homepage, and any slugs pinned ahead of recency. Leave PINNED
// empty for pure newest-first; list a slug to feature it regardless of date.
const HOME_TEASER_COUNT = 2;
const PINNED_SLUGS: string[] = [];

const contentMap: Record<string, ContentItem> = {};

for (const route of routes) {
	if (route.contentSlug) {
		const item = await getPage(route.contentSlug);
		if (item) contentMap[route.contentSlug] = item;
	}
}

// Articles: render once here, resolving each social image to the generated file when present and
// the site default otherwise, so a missing image never breaks the page.
const posts = await listPosts();
const published: Article[] = await Promise.all(
	posts.map(async (post) => {
		const generated = Bun.file(resolve(ogDir, `${post.slug}.png`));
		// Served through the existing /assets/* static handler, which maps /assets/<rel> to
		// static/<rel>. Falls back to the branded default card when no generated file exists.
		const ogImage = (await generated.exists())
			? `/assets/og/${post.slug}.png`
			: OG_DEFAULT_IMAGE_PATH;
		return { ...post, ogImage };
	}),
);

// Homepage teasers: newest first, with any pinned slugs promoted to the front.
const ordered = [
	...PINNED_SLUGS.map((slug) => published.find((p) => p.slug === slug)).filter(
		(p): p is Article => Boolean(p),
	),
	...published.filter((p) => !PINNED_SLUGS.includes(p.slug)),
];
const writing: WritingTeaserItem[] = ordered.slice(0, HOME_TEASER_COUNT).map((post) => ({
	tag: post.tag,
	title: post.title,
	blurb: post.description ?? '',
	href: articlePath(post.slug),
}));

const home = { ...getHomeContent(), writing };

await writeFile(resolve(contentDir, 'data.json'), `${JSON.stringify(contentMap, null, '\t')}\n`);
await writeFile(resolve(contentDir, 'home.json'), `${JSON.stringify(home, null, '\t')}\n`);
await writeFile(
	resolve(contentDir, 'posts.json'),
	`${JSON.stringify({ published }, null, '\t')}\n`,
);
await writeFile(
	resolve(contentDir, 'timeline.json'),
	`${JSON.stringify(getTimeline(), null, '\t')}\n`,
);
await writeFile(
	resolve(contentDir, 'timeline-page.json'),
	`${JSON.stringify(getTimelinePage(), null, '\t')}\n`,
);
await writeFile(
	resolve(contentDir, 'frontend-frameworks.json'),
	`${JSON.stringify(getFrontendFrameworks(), null, '\t')}\n`,
);
await writeFile(
	resolve(contentDir, 'backend-frameworks.json'),
	`${JSON.stringify(getBackendFrameworks(), null, '\t')}\n`,
);
console.log(
	`✓ Built content data (${Object.keys(contentMap).length} pages, ${published.length} posts, home, timeline, frameworks)`,
);
