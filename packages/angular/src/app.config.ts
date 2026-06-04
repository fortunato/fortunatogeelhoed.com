import type { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';

// Same-document page transitions; the slide/cross-fade itself lives in styles/motion.css
// and is gated there for reduced motion and unsupported browsers (which navigate instantly).
export const appConfig: ApplicationConfig = {
	providers: [provideRouter(routes, withViewTransitions())],
};
