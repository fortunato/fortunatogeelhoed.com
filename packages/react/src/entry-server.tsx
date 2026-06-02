import type { ContentItem } from '@fg/shared'
import { renderToString } from 'react-dom/server'
import { StaticRouterProvider, createStaticHandler, createStaticRouter } from 'react-router'
import { ContentProvider } from './content'
import { routes } from './routes'

type ContentMap = Record<string, ContentItem>

export async function render(url: string, content: ContentMap = {}): Promise<string> {
	const handler = createStaticHandler(routes)
	const request = new Request(`http://localhost${url}`)
	const context = await handler.query(request)

	if (context instanceof Response) {
		return ''
	}

	const router = createStaticRouter(handler.dataRoutes, context)

	return renderToString(
		<ContentProvider content={content}>
			<StaticRouterProvider router={router} context={context} />
		</ContentProvider>,
	)
}
