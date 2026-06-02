import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [vue()],
	root: resolve(__dirname),
	resolve: {
		alias: {
			'@fg/shared': resolve(__dirname, '../../packages/shared/src'),
			'@fg/content': resolve(__dirname, '../../packages/content/src'),
		},
	},
	build: {
		outDir: resolve(__dirname, '../../dist/vue'),
		emptyOutDir: true,
	},
	server: {
		port: 5174,
		strictPort: true,
	},
	ssgOptions: {
		script: 'async',
		dirStyle: 'nested',
	},
})
