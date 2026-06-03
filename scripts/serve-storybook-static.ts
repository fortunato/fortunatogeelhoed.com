import { extname, resolve } from 'node:path';

// Minimal static server for the assembled showcase tree (dist/storybook). Used by the
// Playwright parity run and the `serve-storybook` script — avoids an extra static-server
// dependency and serves the composed catalogue from a single origin, as it is hosted.
const root = resolve(import.meta.dirname, '../dist/storybook');
const port = Number(process.env.PORT ?? 6100);

const MIME: Record<string, string> = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.mjs': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.woff2': 'font/woff2',
	'.png': 'image/png',
	'.ico': 'image/x-icon',
	'.map': 'application/json',
};

Bun.serve({
	port,
	async fetch(req) {
		const url = new URL(req.url);
		let pathname = decodeURIComponent(url.pathname);
		if (pathname.endsWith('/')) pathname += 'index.html';

		let file = Bun.file(resolve(root, `.${pathname}`));
		if (!(await file.exists())) {
			// Fall back to a directory index (e.g. /react -> /react/index.html).
			file = Bun.file(resolve(root, `.${pathname}/index.html`));
			if (!(await file.exists())) return new Response('Not found', { status: 404 });
		}
		return new Response(file, {
			headers: { 'content-type': MIME[extname(pathname)] ?? 'application/octet-stream' },
		});
	},
});

console.log(`Serving dist/storybook on http://localhost:${port}`);
