import { renderToString } from 'react-dom/server'
import { StaticRouterProvider, createStaticHandler, createStaticRouter } from 'react-router'
import { routes } from './router'

export async function render(url: string): Promise<string> {
	const handler = createStaticHandler(routes)
	const request = new Request(`http://localhost${url}`)
	const context = await handler.query(request)

	if (context instanceof Response) {
		return ''
	}

	const router = createStaticRouter(handler.dataRoutes, context)

	return renderToString(<StaticRouterProvider router={router} context={context} />)
}
