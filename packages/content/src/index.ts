import { resolve } from 'node:path';
import type { Article, ContentItem } from '@fg/shared';
import { parseArticle, parseContent } from './parser';

const contentDir = resolve(import.meta.dirname, 'pages');
const postsDir = resolve(import.meta.dirname, 'posts');

export async function getPage(slug: string): Promise<ContentItem | null> {
	const file = Bun.file(resolve(contentDir, `${slug}.md`));
	if (!(await file.exists())) return null;
	return parseContent(await file.text());
}

/** All published (non-draft) articles, rendered, newest first. */
export async function listPosts(): Promise<Article[]> {
	const glob = new Bun.Glob('*.md');
	const items: Article[] = [];

	for await (const path of glob.scan({ cwd: postsDir })) {
		const article = parseArticle(await Bun.file(resolve(postsDir, path)).text());
		if (!article.draft) items.push(article);
	}

	return items.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

export { getHomeContent } from './home';
export { getTimeline } from './timeline';
export { getTimelinePage } from './timeline-page';
export { getFrontendFrameworks } from './frontend-frameworks';
export { getBackendFrameworks } from './backend-frameworks';
export { parseContent, parseArticle } from './parser';
export { renderMarkdown } from './render';
