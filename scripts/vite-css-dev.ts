import { existsSync, readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import type { Plugin } from 'vite';
import { cssSourceFiles } from './css-sources';

const root = resolve(import.meta.dirname, '..');
const staticDir = resolve(root, 'static');

const mimeTypes: Record<string, string> = {
	'.woff2': 'font/woff2',
	'.woff': 'font/woff',
	'.ttf': 'font/ttf',
};

export function serveCssDev(): Plugin {
	return {
		name: 'serve-css-dev',
		configureServer(server) {
			server.middlewares.use('/assets/styles.css', (_req, res) => {
				// Ordered global stylesheet sources (see css-sources.ts).
				const css = cssSourceFiles()
					.map((file) => readFileSync(file, 'utf-8'))
					.join('\n');
				res.setHeader('Content-Type', 'text/css');
				res.end(css);
			});

			server.middlewares.use('/assets/', (req, res, next) => {
				const subpath = req.url?.replace(/^\//, '') ?? '';
				const filePath = resolve(staticDir, subpath);
				if (existsSync(filePath)) {
					const mime = mimeTypes[extname(filePath)] ?? 'application/octet-stream';
					res.setHeader('Content-Type', mime);
					res.end(readFileSync(filePath));
					return;
				}
				next();
			});
		},
	};
}
