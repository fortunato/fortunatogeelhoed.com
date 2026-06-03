import 'zone.js/node';
import '@angular/platform-server/init';
import '@angular/compiler';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { ApplicationConfig, Type } from '@angular/core';
import { type BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { CommonEngine } from '@angular/ssr/node';
import { routes as routeDefs } from '@fg/shared';

const distDir = resolve(import.meta.dirname, '../../dist/angular');
const engine = new CommonEngine({ allowedHosts: ['localhost'] });

// Use the Vite-built index.html as the document template (has script tags)
const document = readFileSync(resolve(distDir, 'index.html'), 'utf-8');

async function prerender() {
	// Import from Vite SSR bundle so styleUrl is already resolved
	// The SSR bundle is a build artifact with no declarations; widen the specifier so
	// type-checking neither resolves it nor requires dist/ to exist, then assert the
	// exports this script uses.
	const { AppComponent, config } = (await import(
		'../../dist/angular-ssr/entry-server.js' as string
	)) as { AppComponent: Type<unknown>; config: ApplicationConfig };

	const bootstrap = (context: BootstrapContext) =>
		bootstrapApplication(AppComponent, config, context);

	for (const route of routeDefs) {
		const html = await engine.render({
			bootstrap,
			url: `http://localhost${route.path}`,
			document,
		});

		const filePath =
			route.path === '/'
				? resolve(distDir, 'index.html')
				: resolve(distDir, `${route.path.slice(1)}/index.html`);

		await mkdir(dirname(filePath), { recursive: true });
		await writeFile(filePath, html);
		console.log(`  ✓ ${route.path} → ${filePath}`);
	}

	console.log(`\nPre-rendered ${routeDefs.length} routes to ${distDir}`);
}

prerender();
