import { resolve } from 'node:path';
import angular from '@analogjs/vite-plugin-angular';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

// One runner, several projects — tests live where the behaviour lives:
//   node    → browser-independent pure logic (fast, no DOM)
//   jsdom   → logic that touches browser APIs but is not a component (theme persistence)
//   browser-* → component behaviour in a real browser (Playwright provider, headless Chromium):
//               custom elements + shadow/light DOM, real events, real layout
// Component tests are named *.browser.test.* so the node/jsdom projects never pick them up.
const root = import.meta.dirname;
const alias = {
	'@fg/shared': resolve(root, 'packages/shared/src'),
	'@fg/content': resolve(root, 'packages/content/src'),
	'@styles': resolve(root, 'styles'),
};

const browser = (name: string) =>
	({
		enabled: true,
		provider: 'playwright' as const,
		headless: true,
		instances: [{ browser: 'chromium' }],
		name,
	}) as const;

export default defineConfig({
	resolve: { alias },
	test: {
		projects: [
			{
				resolve: { alias },
				test: {
					name: 'node',
					environment: 'node',
					include: [
						'packages/shared/src/validation/**/*.test.ts',
						'packages/content/src/**/*.test.ts',
						'packages/api/src/**/*.test.ts',
						'scripts/**/*.test.ts',
					],
					exclude: ['**/*.browser.test.*'],
				},
			},
			{
				resolve: { alias },
				test: {
					name: 'dom',
					environment: 'happy-dom',
					include: ['packages/shared/src/**/theme.test.ts'],
				},
			},
			{
				resolve: { alias },
				test: {
					name: 'browser-shared',
					include: ['packages/shared/src/**/*.browser.test.ts'],
					browser: browser('browser-shared'),
				},
			},
			{
				plugins: [react()],
				resolve: { alias },
				test: {
					name: 'browser-react',
					include: ['packages/react/src/**/*.browser.test.{ts,tsx}'],
					browser: browser('browser-react'),
				},
			},
			{
				plugins: [
					vue({
						template: {
							compilerOptions: { isCustomElement: (tag) => tag.startsWith('jb-') },
						},
					}),
				],
				resolve: { alias },
				test: {
					name: 'browser-vue',
					include: ['packages/vue/src/**/*.browser.test.ts'],
					browser: browser('browser-vue'),
				},
			},
			{
				plugins: [angular()],
				resolve: { alias },
				test: {
					name: 'browser-angular',
					include: ['packages/angular/src/**/*.browser.test.ts'],
					setupFiles: ['packages/angular/src/test-setup.ts'],
					browser: browser('browser-angular'),
				},
			},
		],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: [
				'packages/shared/src/**/*.ts',
				'packages/content/src/**/*.ts',
				'packages/api/src/**/*.ts',
				'scripts/**/*.ts',
			],
		},
	},
});
