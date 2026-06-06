import type { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';

// Same-document page transitions; the slide/cross-fade itself lives in styles/motion.css
// and is gated there for reduced motion and unsupported browsers (which navigate instantly).
// Non-destructive hydration reuses the pre-rendered DOM instead of re-rendering it on
// bootstrap — without it the shell visibly reflowed (a large layout shift), matching the
// hydrate-in-place behaviour of the React and Vue builds.
export const appConfig: ApplicationConfig = {
	providers: [
		provideClientHydration(),
		// Reset scroll to the top on navigation. withInMemoryScrolling covers instant
		// navigation and back/forward restore; onViewTransitionCreated resets eagerly —
		// synchronously after startViewTransition, before the new snapshot is captured — so
		// the slide animates from the old offset to the top with no jump afterwards.
		provideRouter(
			routes,
			withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
			withViewTransitions({
				onViewTransitionCreated: ({ from, to }) => {
					if (from.routeConfig !== to.routeConfig) window.scrollTo(0, 0);
				},
			}),
		),
	],
};
