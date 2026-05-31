import { resolve } from 'node:path'
import type { ContentItem } from '@fg/shared'
import { parseContent } from './parser'

const contentDir = resolve(import.meta.dirname, 'pages')

export async function getPage(slug: string): Promise<ContentItem | null> {
	const file = Bun.file(resolve(contentDir, `${slug}.md`))
	if (!(await file.exists())) return null
	return parseContent(await file.text())
}

export async function listByType(type: ContentItem['type']): Promise<ContentItem[]> {
	const glob = new Bun.Glob('*.md')
	const items: ContentItem[] = []

	for await (const path of glob.scan({ cwd: contentDir })) {
		const raw = await Bun.file(resolve(contentDir, path)).text()
		const item = parseContent(raw)
		if (item.type === type && !item.draft) {
			items.push(item)
		}
	}

	return items.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}

export async function getPost(slug: string): Promise<ContentItem | null> {
	const item = await getPage(slug)
	if (!item || item.type !== 'post') return null
	return item
}

export async function listPosts(): Promise<ContentItem[]> {
	return listByType('post')
}

export { parseContent } from './parser'
