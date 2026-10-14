import '@analogjs/vitest-angular/setup-zone';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeEach } from 'vitest';

// Initialise the Angular testing environment for the browser-angular project, so TestBed-backed
// component tests (via @testing-library/angular) run in a real browser.
//
// Vitest 4 can run several test files against one Angular instance in the same page. Angular
// throws if the environment is initialised twice, and its own reset hook is only registered for
// the first file, so initialise once and reset TestBed around every test from this per-file setup.
const testBed = getTestBed();
if (!testBed.platform) {
	testBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}
beforeEach(() => testBed.resetTestingModule());
afterEach(() => testBed.resetTestingModule());
