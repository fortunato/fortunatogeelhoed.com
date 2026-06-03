import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { type ContentItem, routes } from '@fg/shared';
import contentData from '../content/data.json';

const distDir = resolve(import.meta.dirname, '../../dist/react');
const viteOutDir = resolve(distDir);

async function prerender() {
	// Read the Vite-built index.html as the shell template
	const template = await readFile(resolve(viteOutDir, 'index.html'), 'utf-8');
	// The SSR bundle is a build artifact with no declarations; widen the specifier so
	// type-checking neither resolves it nor requires dist/ to exist, then assert the
	// one export this script uses.
	const { render } = (await import('../../dist/react-ssr/entry-server.js' as string)) as {
		render: (url: string, content?: Record<string, ContentItem>) => Promise<string>;
	};

	for (const route of routes) {
		const appHtml = await render(route.path, contentData as Record<string, ContentItem>);
		const html = template.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`);

		const filePath =
			route.path === '/'
				? resolve(distDir, 'index.html')
				: resolve(distDir, `${route.path.slice(1)}/index.html`);

		await mkdir(dirname(filePath), { recursive: true });
		await writeFile(filePath, html);
		console.log(`  ✓ ${route.path} → ${filePath}`);
	}

	console.log(`\nPre-rendered ${routes.length} routes to ${distDir}`);
}

prerender();
