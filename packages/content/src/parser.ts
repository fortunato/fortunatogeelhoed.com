import type { Article, ContentItem } from '@fg/shared';
import matter from 'gray-matter';
import { renderMarkdown } from './render';

// YAML parses an unquoted `date: 2026-06-11` into a Date object. Normalize to an ISO `YYYY-MM-DD`
// string so downstream sorting and rendering can treat dates uniformly.
function toDateString(value: unknown): string | undefined {
	if (value == null) return undefined;
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	return String(value);
}

export function parseContent(raw: string): ContentItem {
	const { data, content } = matter(raw);
	const body = content.trim();
	return {
		title: data.title ?? '',
		slug: data.slug ?? '',
		type: data.type ?? 'page',
		date: toDateString(data.date),
		description: data.description,
		draft: data.draft,
		body,
		// Pre-render the markdown so pages whose copy uses headings, lists, or links render the
		// same structured HTML in all three frameworks (the same path articles take).
		html: renderMarkdown(body).html,
	};
}

/** Parse an article file: frontmatter (including the single topic `tag`) plus the markdown body,
 *  rendered to HTML with an estimated reading time. `ogImage` is left empty here and resolved by
 *  the build step (it depends on whether a generated image exists on disk). */
export function parseArticle(raw: string): Article {
	const { data, content } = matter(raw);
	const body = content.trim();
	const { html, readingMinutes } = renderMarkdown(body);
	return {
		title: data.title ?? '',
		slug: data.slug ?? '',
		type: 'post',
		date: toDateString(data.date),
		description: data.description,
		draft: data.draft,
		tag: data.tag ?? '',
		body,
		html,
		readingMinutes,
		ogImage: '',
	};
}
