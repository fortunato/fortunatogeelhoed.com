import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { cssTargets } from '../../scripts/css-targets';
import { faroSourcemapMode, faroSourcemaps } from '../../scripts/faro-sourcemaps';
import { serveCssDev } from '../../scripts/vite-css-dev';

// Function form so the Faro plugin can be skipped on the `--ssr` pass (same config, two builds).
export default defineConfig(({ isSsrBuild }) => ({
	plugins: [react(), serveCssDev(), ...faroSourcemaps('react', isSsrBuild)],
	root: resolve(__dirname),
	cacheDir: resolve(__dirname, '../../node_modules/.vite-react'),
	resolve: {
		alias: {
			'@fg/shared': resolve(__dirname, '../../packages/shared/src'),
			'@fg/content-data': resolve(__dirname, '../../packages/content'),
			'@fg/content': resolve(__dirname, '../../packages/content/src'),
			'@styles': resolve(__dirname, '../../styles'),
		},
	},
	css: {
		transformer: 'lightningcss',
		lightningcss: { targets: cssTargets },
		// No localsConvention: under lightningcss it drops multi-word CSS-module
		// locals. Kebab classes are read via bracket access (styles['switcher-btn']).
	},
	build: {
		outDir: resolve(__dirname, '../../dist/react'),
		emptyOutDir: true,
		// 'hidden' (no sourceMappingURL comment) on release client builds only; maps go to Faro.
		sourcemap: faroSourcemapMode(isSsrBuild),
	},
	server: {
		port: 5173,
		strictPort: true,
		// Connect HMR directly to this Vite server, bypassing the :3000 proxy
		// (the Hono proxy forwards HTTP only, not WebSocket upgrades).
		hmr: { clientPort: 5173 },
	},
}));
