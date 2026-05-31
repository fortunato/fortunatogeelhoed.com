import type { ContentItem } from '@fg/shared'
import { RouterProvider } from 'react-router'
import { ContentProvider } from './content'
import { router } from './router'

type ContentMap = Record<string, ContentItem>

export function App({ content = {} }: { content?: ContentMap }) {
	return (
		<ContentProvider content={content}>
			<RouterProvider router={router} />
		</ContentProvider>
	)
}
