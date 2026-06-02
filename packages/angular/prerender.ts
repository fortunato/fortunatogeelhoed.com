import 'zone.js/node'
import '@angular/platform-server/init'
import '@angular/compiler'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { bootstrapApplication } from '@angular/platform-browser'
import { CommonEngine } from '@angular/ssr/node'
import { routes as routeDefs } from '@fg/shared'
import { AppComponent } from './src/app.component'
import { config } from './src/app.config.server'

const distDir = resolve(import.meta.dirname, '../../dist/angular')
const engine = new CommonEngine({ allowedHosts: ['localhost'] })

const bootstrap = (context: unknown) => bootstrapApplication(AppComponent, config, context)

async function prerender() {
	for (const route of routeDefs) {
		const html = await engine.render({
			bootstrap,
			url: `http://localhost${route.path}`,
			document: '<html><body><app-root></app-root></body></html>',
		})

		const filePath =
			route.path === '/'
				? resolve(distDir, 'index.html')
				: resolve(distDir, `${route.path.slice(1)}/index.html`)

		await mkdir(dirname(filePath), { recursive: true })
		await writeFile(filePath, html)
		console.log(`  ✓ ${route.path} → ${filePath}`)
	}

	console.log(`\nPre-rendered ${routeDefs.length} routes to ${distDir}`)
}

prerender()
