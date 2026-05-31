import type { ContentItem } from '@fg/shared'
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { setContent } from './composables/useContent'
import { routes } from './router'

export const createApp = ViteSSG(App, { routes }, async ({ isClient }) => {
	if (!isClient) {
		const { getPage } = await import('@fg/content')
		const { routes: routeDefs } = await import('@fg/shared')
		const contentMap: Record<string, ContentItem> = {}
		for (const route of routeDefs) {
			if (route.contentSlug) {
				const item = await getPage(route.contentSlug)
				if (item) contentMap[route.contentSlug] = item
			}
		}
		setContent(contentMap)
	}
})
