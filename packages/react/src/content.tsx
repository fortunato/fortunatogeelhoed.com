import type { ContentItem } from '@fg/shared'
import { createContext, useContext } from 'react'

type ContentMap = Record<string, ContentItem>

const ContentContext = createContext<ContentMap>({})

export function ContentProvider({
	content,
	children,
}: { content: ContentMap; children: React.ReactNode }) {
	return <ContentContext value={content}>{children}</ContentContext>
}

export function useContent(slug: string): ContentItem | undefined {
	return useContext(ContentContext)[slug]
}
