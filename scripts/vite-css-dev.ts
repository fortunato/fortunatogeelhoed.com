import { existsSync, readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import type { Plugin } from 'vite';

const root = resolve(import.meta.dirname, '..');
const stylesDir = resolve(root, 'styles');
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
				// layers.css declares the @layer order and MUST load first.
				const layers = readFileSync(resolve(stylesDir, 'layers.css'), 'utf-8');
				const reset = readFileSync(resolve(stylesDir, 'reset.css'), 'utf-8');
				const tokens = readFileSync(resolve(stylesDir, 'tokens.css'), 'utf-8');
				const base = readFileSync(resolve(stylesDir, 'base.css'), 'utf-8');
				res.setHeader('Content-Type', 'text/css');
				res.end(`${layers}\n${reset}\n${tokens}\n${base}`);
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
