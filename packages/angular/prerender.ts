import 'zone.js/node';
import '@angular/platform-server/init';
import '@angular/compiler';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { ApplicationConfig, Type } from '@angular/core';
import { type BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { CommonEngine } from '@angular/ssr/node';
import { articlePathsFromPosts, routes as routeDefs } from '@fg/shared';
import postsData from '../content/posts.json';

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

	// Each published article gets its own static page under /writing/<slug>; the dynamic
	// :slug route is not reachable from the route list above, so enumerate the paths here.
	const articlePaths = articlePathsFromPosts(
		(postsData as { published: { slug: string }[] }).published,
	);

	for (const path of articlePaths) {
		const html = await engine.render({
			bootstrap,
			url: `http://localhost${path}`,
			document,
		});

		const filePath = resolve(distDir, `${path.slice(1)}/index.html`);
		await mkdir(dirname(filePath), { recursive: true });
		await writeFile(filePath, html);
		console.log(`  ✓ ${path} → ${filePath}`);
	}

	const total = routeDefs.length + articlePaths.length;
	console.log(`\nPre-rendered ${total} routes to ${distDir}`);
}

prerender();
