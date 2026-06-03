import { bootstrapApplication } from '@angular/platform-browser';
import { initSwitchTransition } from '@fg/shared';
import { registerElements } from '@fg/shared/elements';
import { AppComponent } from './app.component';
import { appConfig } from './app.config';

// Register the shared web components. Safe here: this client entry never runs during
// prerender (that uses entry-server.ts via CommonEngine).
registerElements();

bootstrapApplication(AppComponent, appConfig).then(() => initSwitchTransition());
