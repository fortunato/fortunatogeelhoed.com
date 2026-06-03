import { resolve } from 'node:path';
import { defineConfig } from '@playwright/test';

const repoRoot = resolve(import.meta.dirname, '../..');

// Cross-framework visual-regression. Runs against the assembled static showcase (the same
// artifact that ships), serving it from one origin. The three framework Contact Form tests
// share a single baseline (see snapshotPathTemplate) so any drift between React, Vue, and
// Angular fails the build — that is the parity gate.
export default defineConfig({
	testDir: '.',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: 0,
	reporter: process.env.CI ? 'github' : 'list',
	webServer: {
		command: 'PORT=6100 bun run scripts/serve-storybook-static.ts',
		cwd: repoRoot,
		url: 'http://localhost:6100/index.json',
		reuseExistingServer: !process.env.CI,
		timeout: 60_000,
	},
	use: { baseURL: 'http://localhost:6100' },
	// Shared baseline across the framework tests (no per-test name) → enforces parity.
	// Platform-suffixed so Linux baselines are used consistently locally and in CI.
	snapshotPathTemplate: '{testDir}/__snapshots__/{arg}-{platform}{ext}',
	expect: {
		toHaveScreenshot: { maxDiffPixelRatio: 0.03, animations: 'disabled' },
	},
});
