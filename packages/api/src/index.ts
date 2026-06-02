import { Hono } from 'hono';
import { frameworkMiddleware } from './middleware/framework';
import { renderShell } from './shell';

const isDev = process.env.NODE_ENV !== 'production';

// Load CSS manifest for production hashed filenames
let stylesheetPath = '/assets/styles.css';
if (!isDev) {
	try {
		const manifest = await Bun.file('./dist/assets/manifest.json').json();
		stylesheetPath = `/assets/${manifest['styles.css']}`;
	} catch {
		// fallback to unhashed path
	}
}

const app = new Hono();

// Framework detection middleware
app.use('*', frameworkMiddleware);

// Static assets — CDN-ready with long cache
app.use('/assets/*', async (c, next) => {
	await next();
	if (c.res.status === 200) {
		c.res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	}
});

if (isDev) {
	// Dev: serve combined CSS on the fly
	app.get('/assets/styles.css', async (c) => {
		const reset = await Bun.file('./styles/reset.css').text();
		const tokens = await Bun.file('./styles/tokens.css').text();
		const base = await Bun.file('./styles/base.css').text();
		c.header('Content-Type', 'text/css');
		return c.body(`${reset}\n${tokens}\n${base}`);
	});
}

// Serve assets, framework-aware. Each framework bundles its own JS/CSS into
// dist/<framework>/assets/ (referenced as /assets/*), so the per-framework
// build must be tried first; the shared hashed CSS lives in dist/assets/ and
// fonts in static/. Without this the bundles fall through to the HTML handler
// and hydration never runs.
app.get('/assets/*', async (c, next) => {
	const framework = c.get('framework');
	const rel = c.req.path.replace('/assets/', '');
	const candidates = [
		`./dist/${framework}/assets/${rel}`,
		`./dist/assets/${rel}`,
		`./static/${rel}`,
	];
	for (const candidate of candidates) {
		const file = Bun.file(candidate);
		if (await file.exists()) {
			return new Response(file);
		}
	}
	// Never fall through to the HTML app shell for an asset URL: that response
	// would be cached as immutable (see middleware above) and poison the
	// browser cache for a year. In dev, let the Vite proxy try; in prod, 404.
	return isDev ? next() : c.body('Not found', 404);
});

if (isDev) {
	const PORTS: Record<string, number> = { react: 5173, vue: 5174, angular: 5175 };

	app.all('*', async (c) => {
		const framework = c.get('framework');
		const port = PORTS[framework];
		const url = new URL(c.req.url);
		const target = `http://localhost:${port}${url.pathname}${url.search}`;

		try {
			const res = await fetch(target, {
				method: c.req.method,
				headers: c.req.raw.headers,
			});
			return new Response(res.body, {
				status: res.status,
				headers: res.headers,
			});
		} catch {
			// Vite dev server not running — serve shell with placeholder
			return c.html(
				renderShell({
					framework,
					bodyHtml: `<div style="padding:4rem;text-align:center;color:var(--text-secondary)">
					<h1 style="font-family:var(--font-display);margin-bottom:1rem">${framework}</h1>
					<p>Dev server not running on port ${port}.</p>
					<p style="margin-top:0.5rem;font-family:var(--font-mono);font-size:0.8rem">bun dev:${framework}</p>
				</div>`,
				}),
			);
		}
	});
} else {
	// Production: serve pre-rendered static HTML from dist/
	app.get('*', async (c) => {
		const framework = c.get('framework');
		const path = c.req.path === '/' ? '/index.html' : `${c.req.path}/index.html`;
		const filePath = `./dist/${framework}${path}`;

		const file = Bun.file(filePath);
		if (await file.exists()) {
			const html = await file.text();
			c.header('Cache-Control', 'no-cache');
			return c.html(html);
		}

		// Fallback to root index
		const fallback = Bun.file(`./dist/${framework}/index.html`);
		if (await fallback.exists()) {
			c.header('Cache-Control', 'no-cache');
			return c.html(await fallback.text());
		}

		return c.html(
			renderShell({ framework, stylesheetPath, bodyHtml: '<p>Page not found</p>' }),
			404,
		);
	});
}

export default {
	port: 3000,
	fetch: app.fetch,
};
