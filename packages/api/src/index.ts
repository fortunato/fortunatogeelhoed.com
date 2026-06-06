import { contactSchema } from '@fg/shared/validation/contact';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';
import { cssSourceFiles } from '../../../scripts/css-sources';
import { getAvailability } from './availability';
import { applyAvailability } from './html';
import { requestLogger } from './logger';
import { type AppEnv, frameworkMiddleware } from './middleware/framework';
import { handleRum } from './rum';
import { renderShell } from './shell';

const isDev = process.env.NODE_ENV !== 'production';

// Server-side theme: rewrite the prerendered <html data-theme> from the `theme`
// cookie so the correct theme paints with no flash, even with JS disabled.
function applyTheme(html: string, theme: 'dark' | 'light'): string {
	return html.replace(/data-theme="(?:dark|light)"/, `data-theme="${theme}"`);
}

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

const app = new Hono<AppEnv>();

// Structured access logging (skips static assets internally).
app.use('*', requestLogger());

// Framework detection middleware
app.use('*', frameworkMiddleware);

// Static assets — CDN-ready with long cache
app.use('/assets/*', async (c, next) => {
	await next();
	if (c.res.status === 200) {
		// Hashed prod assets are immutable; dev assets are unhashed and regenerated on
		// the fly, so they must revalidate or stale CSS sticks for a year.
		c.res.headers.set(
			'Cache-Control',
			isDev ? 'no-cache' : 'public, max-age=31536000, immutable',
		);
	}
});

if (isDev) {
	// Dev: serve combined CSS on the fly (see scripts/css-sources.ts for ordering).
	app.get('/assets/styles.css', async (c) => {
		const css = (await Promise.all(cssSourceFiles().map((file) => Bun.file(file).text()))).join(
			'\n',
		);
		c.header('Content-Type', 'text/css');
		return c.body(css);
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

// Framework switch as a real, user-initiated navigation: a scripted reload can
// never trigger a cross-document view transition, but a link click can. Sets the
// framework cookie and redirects back to the page the visitor came from.
app.get('/__switch', (c) => {
	const to = c.req.query('to');
	if (to === 'react' || to === 'vue' || to === 'angular') {
		setCookie(c, 'framework', to, { path: '/', maxAge: 60 * 60 * 24 * 365 });
	}
	let next = '/';
	const ref = c.req.header('referer');
	if (ref) {
		try {
			const u = new URL(ref);
			if (u.origin === new URL(c.req.url).origin) next = u.pathname + u.search;
		} catch {
			// malformed referer — fall back to "/"
		}
	}
	return c.redirect(next, 302);
});

// Contact form submission. Validates with the same Zod schema the browser forms use, so the
// client and server can never disagree on what counts as valid. Validation-only for now: a
// well-formed payload is acknowledged but not yet delivered or stored.
app.post('/api/contact', async (c) => {
	const payload = await c.req.json().catch(() => null);
	const result = contactSchema.safeParse(payload);
	if (!result.success) {
		return c.json({ errors: z.flattenError(result.error).fieldErrors }, 422);
	}
	return c.json({ ok: true });
});

// Live availability for the contact-page badge. Reads a gist Fortunato controls, behind a
// heavy cache so visitor traffic never hits GitHub's rate limit. The handler always returns
// a valid value, so the page can trust the response without special-casing failures.
app.get('/api/availability', async (c) => {
	const data = await getAvailability();
	c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
	return c.json(data);
});

// First-party proxy for frontend RUM (Grafana Faro). Strips identifiers, hides the collector
// key, and forwards fire-and-forget. See rum.ts.
app.post('/api/rum', handleRum);

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
					theme: getCookie(c, 'theme') === 'light' ? 'light' : 'dark',
					bodyHtml: `<div style="padding:4rem;text-align:center;color:var(--jb-text-secondary)">
					<h1 style="font-family:var(--jb-font-display);margin-bottom:1rem">${framework}</h1>
					<p>Dev server not running on port ${port}.</p>
					<p style="margin-top:0.5rem;font-family:var(--jb-font-mono);font-size:0.8rem">bun dev:${framework}</p>
				</div>`,
				}),
			);
		}
	});
} else {
	// Production: serve pre-rendered static HTML from dist/
	app.get('*', async (c) => {
		const framework = c.get('framework');
		const theme = getCookie(c, 'theme') === 'light' ? 'light' : 'dark';
		const path = c.req.path === '/' ? '/index.html' : `${c.req.path}/index.html`;
		const filePath = `./dist/${framework}${path}`;

		const file = Bun.file(filePath);
		if (await file.exists()) {
			let html = applyTheme(await file.text(), theme);
			// The contact page carries the live availability badge: patch the prerendered markup
			// to the current value and seed the client so hydration matches.
			if (c.req.path === '/contact') {
				html = applyAvailability(html, await getAvailability());
			}
			c.header('Cache-Control', 'no-cache');
			return c.html(html);
		}

		// Fallback to root index
		const fallback = Bun.file(`./dist/${framework}/index.html`);
		if (await fallback.exists()) {
			c.header('Cache-Control', 'no-cache');
			return c.html(applyTheme(await fallback.text(), theme));
		}

		return c.html(
			renderShell({ framework, theme, stylesheetPath, bodyHtml: '<p>Page not found</p>' }),
			404,
		);
	});
}

// Exported so tests can drive the real, fully-wired app (middleware + registered routes)
// through app.request, rather than re-declaring routes that could drift from these.
export { app };

export default {
	port: 3000,
	fetch: app.fetch,
};
