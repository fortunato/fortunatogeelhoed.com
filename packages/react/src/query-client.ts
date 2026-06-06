import { QueryClient } from '@tanstack/react-query';

// One factory used by both the client entry and the prerender, so server and browser share
// identical query defaults. staleTime mirrors the endpoint's max-age=60: a value is considered
// fresh for a minute, then refetched in the background (and on window focus, which is on by
// default). A fresh QueryClient is created per app instance so nothing leaks between renders.
export function makeQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: { queries: { staleTime: 60_000 } },
	});
}
