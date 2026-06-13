import { provideHttpClient, withFetch } from '@angular/common/http';
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
		// Fetch-based HttpClient backs the signal-native httpResource() used for live
		// availability; withFetch keeps it consistent across server and browser.
		provideHttpClient(withFetch()),
		// Scroll handling lives in AppComponent (a NavigationEnd subscriber): top on navigation,
		// but the saved offset restored on a framework-switch arrival. The router's own
		// scrollPositionRestoration is therefore 'disabled' — left as 'top' it fired *after* our
		// restore and clobbered it back to the top (the switch scroll was lost on → Angular).
		// onViewTransitionCreated still resets eagerly before the snapshot so the SPA slide animates
		// from the old offset to the top with no jump.
		provideRouter(
			routes,
			withInMemoryScrolling({
				scrollPositionRestoration: 'disabled',
				anchorScrolling: 'enabled',
			}),
			withViewTransitions({
				// Skip the view transition on the initial navigation. On a framework-switch arrival
				// Angular was the only framework auto-running a VT on first load; its new-root snapshot
				// painted the fully constructed page over the JS reassemble for a frame — the "flash of
				// the constructed page before the assembly". React has no VT hook and Vue's initial nav
				// is already guarded, so this brings Angular in line: the reassemble is the sole entrance.
				skipInitialTransition: true,
				onViewTransitionCreated: ({ from, to }) => {
					if (from.routeConfig !== to.routeConfig) window.scrollTo(0, 0);
				},
			}),
		),
	],
};
