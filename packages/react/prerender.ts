import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { routes } from '@fg/shared'

const distDir = resolve(import.meta.dirname, '../../dist/react')

async function prerender() {
	const { render } = await import('./src/entry-server.tsx')

	for (const route of routes) {
		const html = await render(route.path)
		const filePath =
			route.path === '/'
				? resolve(distDir, 'index.html')
				: resolve(distDir, `${route.path.slice(1)}/index.html`)

		await mkdir(dirname(filePath), { recursive: true })
		await writeFile(filePath, html)
		console.log(`  ✓ ${route.path} → ${filePath}`)
	}

	console.log(`\nPre-rendered ${routes.length} routes to ${distDir}`)
}

prerender()
