import { bootstrapApplication } from '@angular/platform-browser';
import { initSwitchTransition } from '@fg/shared';
import { registerElements } from '@fg/shared/elements';
import { startRum } from '@fg/shared/rum';
import { AppComponent } from './app.component';
import { appConfig } from './app.config';

// Register the shared web components. Safe here: this client entry never runs during
// prerender (that uses entry-server.ts via CommonEngine).
registerElements();

// Start the switch transition BEFORE bootstrapping, so the reassemble plays on the already-painted
// (hidden) prerendered DOM concurrently with hydration — matching React/Vue. Calling it inside the
// post-bootstrap .then() delayed the reassemble until after Angular fully hydrated, holding the page
// hidden through bootstrap and making the switch *to* Angular look broken. initSwitchTransition only
// touches sessionStorage, the document root, and a click listener, so it needs nothing from Angular.
initSwitchTransition();

bootstrapApplication(AppComponent, appConfig).then(() => {
	startRum('angular');
});
