import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
	plugins: [react()],
	root: resolve(__dirname),
	resolve: {
		alias: {
			'@fg/shared': resolve(__dirname, '../../packages/shared/src'),
			'@fg/content': resolve(__dirname, '../../packages/content/src'),
		},
	},
	build: {
		outDir: resolve(__dirname, '../../dist/react'),
		emptyOutDir: true,
	},
	server: {
		port: 5173,
		strictPort: true,
	},
})
