import '@analogjs/vitest-angular/setup-zone';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

// Initialise the Angular testing environment once for the browser-angular project, so
// TestBed-backed component tests (via @testing-library/angular) run in a real browser.
// Vitest 4 can evaluate this setup file more than once in the same browser page, and Angular
// throws if the environment is initialised twice, so only do it while TestBed has no platform yet.
const testBed = getTestBed();
if (!testBed.platform) {
	testBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}
