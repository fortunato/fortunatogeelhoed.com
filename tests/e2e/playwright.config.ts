import { resolve } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const repoRoot = resolve(import.meta.dirname, '../..');

// End-to-end against the production Hono server over the built output — the same artifact
// that ships. Requires `bun run build` to have produced dist/ beforehand (CI builds first).
export default defineConfig({
	testDir: '.',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	webServer: {
		command: 'NODE_ENV=production bun run packages/api/src/index.ts',
		cwd: repoRoot,
		url: 'http://localhost:3000/',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
	use: { baseURL: 'http://localhost:3000' },
	projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }],
});
