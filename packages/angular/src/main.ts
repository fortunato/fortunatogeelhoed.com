import { bootstrapApplication } from '@angular/platform-browser';
import { initSwitchTransition } from '@fg/shared';
import { AppComponent } from './app.component';
import { appConfig } from './app.config';

bootstrapApplication(AppComponent, appConfig).then(() => initSwitchTransition());
