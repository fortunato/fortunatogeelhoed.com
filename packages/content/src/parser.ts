import type { ContentItem } from '@fg/shared'
import matter from 'gray-matter'

export function parseContent(raw: string): ContentItem {
	const { data, content } = matter(raw)
	return {
		title: data.title ?? '',
		slug: data.slug ?? '',
		type: data.type ?? 'page',
		date: data.date,
		description: data.description,
		draft: data.draft,
		body: content.trim(),
	}
}
