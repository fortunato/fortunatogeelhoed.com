import type { ContentItem } from '@fg/shared';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { ContentProvider } from './content';
import { makeQueryClient } from './query-client';
import { router } from './router';

type ContentMap = Record<string, ContentItem>;

export function App({ content = {} }: { content?: ContentMap }) {
	// One client per mounted app, created lazily so it survives re-renders without leaking.
	const [queryClient] = useState(makeQueryClient);

	return (
		<QueryClientProvider client={queryClient}>
			<ContentProvider content={content}>
				<RouterProvider router={router} />
			</ContentProvider>
		</QueryClientProvider>
	);
}
