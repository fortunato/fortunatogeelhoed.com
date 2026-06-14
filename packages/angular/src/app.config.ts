import { provideHttpClient, withFetch } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

// In-app navigation smooth-scrolls to the top and then plays the destination's entrance; that
// sequence is owned by shared code wired in AppComponent (identical in React, Vue, and Angular),
// so the router runs no view transition of its own. Non-destructive hydration reuses the
// pre-rendered DOM instead of re-rendering on bootstrap — without it the shell visibly reflowed.
export const appConfig: ApplicationConfig = {
	providers: [
		provideClientHydration(),
		// Fetch-based HttpClient backs the signal-native httpResource() used for live
		// availability; withFetch keeps it consistent across server and browser.
		provideHttpClient(withFetch()),
		// Scroll handling lives in AppComponent: the shared interceptor smooth-scrolls before each
		// in-app navigation, and AppComponent restores the saved offset on a framework-switch
		// arrival. The router's own scrollPositionRestoration is therefore 'disabled' — left on it
		// fought our handling (it fired after the switch restore and clobbered it back to the top).
		provideRouter(
			routes,
			withInMemoryScrolling({
				scrollPositionRestoration: 'disabled',
				anchorScrolling: 'enabled',
			}),
		),
	],
};
