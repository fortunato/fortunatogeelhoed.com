import { resolve } from 'node:path';
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vite';
import { cssTargets } from '../../scripts/css-targets';
import { faroSourcemapMode, faroSourcemaps } from '../../scripts/faro-sourcemaps';
import { serveCssDev } from '../../scripts/vite-css-dev';

// This config builds only the client bundle; the server build uses vite.config.ssr.ts, so the Faro
// plugin here never touches SSR output.
export default defineConfig({
	plugins: [
		angular({
			tsconfig: resolve(__dirname, 'tsconfig.json'),
		}),
		serveCssDev(),
		...faroSourcemaps('angular'),
	],
	root: resolve(__dirname),
	cacheDir: resolve(__dirname, '../../node_modules/.vite-angular'),
	resolve: {
		alias: {
			'@fg/shared': resolve(__dirname, '../../packages/shared/src'),
			'@fg/content-data': resolve(__dirname, '../../packages/content'),
			'@fg/content': resolve(__dirname, '../../packages/content/src'),
			'@styles': resolve(__dirname, '../../styles'),
		},
	},
	css: {
		// lightningcss with CSS Modules explicitly OFF: it prefixes/downlevels
		// component CSS to the shared targets WITHOUT hashing class names, so
		// Angular's emulated ViewEncapsulation remains responsible for scoping.
		// (`css.modules` is ignored under lightningcss — `css.lightningcss.cssModules`
		// is the effective switch.)
		transformer: 'lightningcss',
		lightningcss: { targets: cssTargets, cssModules: false },
	},
	build: {
		outDir: resolve(__dirname, '../../dist/angular'),
		emptyOutDir: true,
		// 'hidden' (no sourceMappingURL comment) on release client builds only; maps go to Faro.
		sourcemap: faroSourcemapMode(),
	},
	server: {
		port: 5175,
		strictPort: true,
		// Connect HMR directly to this Vite server, bypassing the :3000 proxy
		// (the Hono proxy forwards HTTP only, not WebSocket upgrades).
		hmr: { clientPort: 5175 },
	},
});
