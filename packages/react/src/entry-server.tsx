import type { ContentItem } from '@fg/shared';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderToString } from 'react-dom/server';
import { StaticRouterProvider, createStaticHandler, createStaticRouter } from 'react-router';
import { ContentProvider } from './content';
import { makeQueryClient } from './query-client';
import { routes } from './routes';

type ContentMap = Record<string, ContentItem>;

export async function render(url: string, content: ContentMap = {}): Promise<string> {
	const handler = createStaticHandler(routes);
	const request = new Request(`http://localhost${url}`);
	const context = await handler.query(request);

	if (context instanceof Response) {
		return '';
	}

	const router = createStaticRouter(handler.dataRoutes, context);
	const queryClient = makeQueryClient();

	return renderToString(
		<QueryClientProvider client={queryClient}>
			<ContentProvider content={content}>
				<StaticRouterProvider router={router} context={context} />
			</ContentProvider>
		</QueryClientProvider>,
	);
}
