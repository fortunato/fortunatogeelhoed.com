import { resolve } from 'node:path';
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vite';
import { serveCssDev } from '../../scripts/vite-css-dev';

export default defineConfig({
	plugins: [
		angular({
			tsconfig: resolve(__dirname, 'tsconfig.json'),
		}),
		serveCssDev(),
	],
	root: resolve(__dirname),
	cacheDir: resolve(__dirname, '../../node_modules/.vite-angular'),
	resolve: {
		alias: {
			'@fg/shared': resolve(__dirname, '../../packages/shared/src'),
			'@fg/content': resolve(__dirname, '../../packages/content/src'),
			'@styles': resolve(__dirname, '../../styles'),
		},
	},
	css: {
		// Disable CSS module hashing — Angular uses ViewEncapsulation for scoping
		modules: false,
	},
	build: {
		outDir: resolve(__dirname, '../../dist/angular'),
		emptyOutDir: true,
	},
	server: {
		port: 5175,
		strictPort: true,
		// Connect HMR directly to this Vite server, bypassing the :3000 proxy
		// (the Hono proxy forwards HTTP only, not WebSocket upgrades).
		hmr: { clientPort: 5175 },
	},
});
