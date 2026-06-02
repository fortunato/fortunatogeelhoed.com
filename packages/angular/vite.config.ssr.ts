import { resolve } from 'node:path';
import angular from '@analogjs/vite-plugin-angular';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import { cssTargets } from '../../scripts/css-targets';

// Get the Angular plugins and remove the routerPlugin that fails in SSR mode
const angularPlugins = angular({
	tsconfig: resolve(__dirname, 'tsconfig.json'),
}) as Plugin[];

const ssrPlugins = angularPlugins.filter((p) => p.name !== 'analogjs-router-optimization');

export default defineConfig({
	plugins: ssrPlugins,
	root: resolve(__dirname),
	resolve: {
		alias: {
			'@fg/shared': resolve(__dirname, '../../packages/shared/src'),
			'@fg/content': resolve(__dirname, '../../packages/content/src'),
			'@styles': resolve(__dirname, '../../styles'),
		},
	},
	css: {
		// lightningcss with CSS Modules off (see vite.config.ts): transform without
		// hashing so Angular's ViewEncapsulation handles scoping.
		transformer: 'lightningcss',
		lightningcss: { targets: cssTargets, cssModules: false },
	},
	build: {
		outDir: resolve(__dirname, '../../dist/angular-ssr'),
		emptyOutDir: true,
		ssr: true,
		rollupOptions: {
			input: resolve(__dirname, 'src/entry-server.ts'),
		},
	},
	ssr: {
		external: [/^@angular\//, 'zone.js', 'zone.js/node', 'rxjs'],
		noExternal: ['@fg/shared', '@fg/content'],
	},
});
