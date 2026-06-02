import { resolve } from 'node:path'
import angular from '@analogjs/vite-plugin-angular'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		angular({
			tsconfig: resolve(__dirname, 'tsconfig.json'),
		}),
	],
	root: resolve(__dirname),
	resolve: {
		alias: {
			'@fg/shared': resolve(__dirname, '../../packages/shared/src'),
			'@fg/content': resolve(__dirname, '../../packages/content/src'),
		},
	},
	build: {
		outDir: resolve(__dirname, '../../dist/angular'),
		emptyOutDir: true,
	},
	server: {
		port: 5175,
		strictPort: true,
	},
})
