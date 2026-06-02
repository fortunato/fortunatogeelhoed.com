import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { cssTargets } from '../../scripts/css-targets';
import { serveCssDev } from '../../scripts/vite-css-dev';

export default defineConfig({
	plugins: [react(), serveCssDev()],
	root: resolve(__dirname),
	cacheDir: resolve(__dirname, '../../node_modules/.vite-react'),
	resolve: {
		alias: {
			'@fg/shared': resolve(__dirname, '../../packages/shared/src'),
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
	},
	server: {
		port: 5173,
		strictPort: true,
		// Connect HMR directly to this Vite server, bypassing the :3000 proxy
		// (the Hono proxy forwards HTTP only, not WebSocket upgrades).
		hmr: { clientPort: 5173 },
	},
});
