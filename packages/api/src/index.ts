import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { frameworkMiddleware } from './middleware/framework'
import { renderShell } from './shell'

const app = new Hono()

// Framework detection middleware
app.use('*', frameworkMiddleware)

// Static assets — CDN-ready with long cache
app.use(
	'/assets/*',
	serveStatic({
		root: './',
		rewriteRequestPath: (path) => path.replace('/assets/', '/static/'),
	}),
)

// Styles served from combined CSS
app.get('/assets/styles.css', async (c) => {
	const reset = await Bun.file('./styles/reset.css').text()
	const tokens = await Bun.file('./styles/tokens.css').text()
	const base = await Bun.file('./styles/base.css').text()
	c.header('Content-Type', 'text/css')
	c.header('Cache-Control', 'public, max-age=31536000, immutable')
	return c.body(`${reset}\n${tokens}\n${base}`)
})

// Font files
app.use(
	'/assets/fonts/*',
	serveStatic({
		root: './',
		rewriteRequestPath: (path) => path.replace('/assets/fonts/', '/static/fonts/'),
	}),
)

// Dev mode: proxy to framework dev servers
const isDev = process.env.NODE_ENV !== 'production'

if (isDev) {
	const PORTS: Record<string, number> = { react: 5173, vue: 5174, angular: 5175 }

	app.all('*', async (c) => {
		const framework = c.get('framework')
		const port = PORTS[framework]
		const url = new URL(c.req.url)
		const target = `http://localhost:${port}${url.pathname}${url.search}`

		try {
			const res = await fetch(target, {
				method: c.req.method,
				headers: c.req.raw.headers,
			})
			return new Response(res.body, {
				status: res.status,
				headers: res.headers,
			})
		} catch {
			// Vite dev server not running — serve shell with placeholder
			return c.html(renderShell({
				framework,
				bodyHtml: `<div style="padding:4rem;text-align:center;color:var(--text-secondary)">
					<h1 style="font-family:var(--font-display);margin-bottom:1rem">${framework}</h1>
					<p>Dev server not running on port ${port}.</p>
					<p style="margin-top:0.5rem;font-family:var(--font-mono);font-size:0.8rem">bun dev:${framework}</p>
				</div>`,
			}))
		}
	})
} else {
	// Production: serve pre-rendered static HTML from dist/
	app.get('*', async (c) => {
		const framework = c.get('framework')
		const path = c.req.path === '/' ? '/index.html' : `${c.req.path}/index.html`
		const filePath = `./dist/${framework}${path}`

		const file = Bun.file(filePath)
		if (await file.exists()) {
			const html = await file.text()
			return c.html(html)
		}

		// Fallback to root index
		const fallback = Bun.file(`./dist/${framework}/index.html`)
		if (await fallback.exists()) {
			return c.html(await fallback.text())
		}

		return c.html(renderShell({ framework, bodyHtml: '<p>Page not found</p>' }), 404)
	})
}

export default {
	port: 3000,
	fetch: app.fetch,
}
