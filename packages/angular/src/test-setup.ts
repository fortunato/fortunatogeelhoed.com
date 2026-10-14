import '@analogjs/vitest-angular/setup-zone';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

// Initialise the Angular testing environment for the browser-angular project, so TestBed-backed
// component tests (via @testing-library/angular) run in a real browser. Vitest 4 can run several
// test files against one Angular instance in the same page, so setupTestBed initialises the
// environment only once and registers TestBed's reset hooks for every file, not just the first.
setupTestBed({ zoneless: false });
