# fortunatogeelhoed.com

A portfolio site built three times — in React, Vue, and Angular — served from a single Bun/Hono backend. The same content, the same design, three different framework implementations.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Hono Server                      │
│  ┌─────────────────────────────────────────────┐ │
│  │  Framework Middleware (cookie → react/vue/…) │ │
│  └─────────────────────────────────────────────┘ │
│          │              │              │          │
│    dist/react/    dist/vue/    dist/angular/      │
│   (pre-rendered)  (pre-rendered)  (pre-rendered)  │
└─────────────────────────────────────────────────┘
         ↕                ↕              ↕
    Client hydrates the framework matching the cookie
```

**Key decisions:**

- **SSG from day one.** All frameworks pre-render every route at build time. The server sends static HTML; the client hydrates.
- **Cookie-based switching.** A `framework` cookie (default: `react`) tells Hono which pre-rendered output to serve. A vanilla JS switcher in the HTML shell toggles it.
- **React is canonical.** Vue and Angular variants carry `<meta name="robots" content="noindex">` to avoid duplicate content.
- **CDN-ready assets.** CSS is content-hashed (`styles-[hash].css`), static assets served with `Cache-Control: immutable`, HTML served with `no-cache`.
- **Shared content pipeline.** Gray-matter parses Markdown frontmatter at build time; all frameworks consume the same content.
- **Single runtime.** Bun handles everything — dev server, builds, SSG scripts, production serving.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun 1.3+ |
| Server | Hono |
| React | React 19, React Router 7, custom prerender script |
| Vue | Vue 3.5, Vue Router 4, vite-ssg |
| Angular | Angular 21, AnalogJS (Vite-powered) |
| Content | gray-matter + Markdown |
| Build | Vite 6, Nx (integrated monorepo) |
| Lint/Format | Biome (tabs, 4-space width, single quotes) |

## Getting Started

```bash
# Install Bun (if needed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Dev mode — single framework + Hono
bun dev:react    # React on :5173, Hono on :3000
bun dev:vue      # Vue on :5174, Hono on :3000
bun dev:angular  # Angular on :5175, Hono on :3000

# Dev mode — all frameworks at once
bun dev:all

# Production build
bun run build

# Production serve
bun start        # Hono on :3000, serves pre-rendered HTML
```

## Project Structure

```
repo/
├── packages/
│   ├── api/          # Hono server (framework middleware, shell, static serving)
│   ├── react/        # React app (React Router, custom SSG via renderToString)
│   ├── vue/          # Vue app (Vue Router, vite-ssg)
│   ├── angular/      # Angular app (standalone components, AnalogJS)
│   ├── shared/       # TypeScript types (ContentItem, RouteDefinition)
│   └── content/      # Gray-matter content parser + markdown pages
├── styles/           # Shared CSS (reset, design tokens, base styles)
├── static/fonts/     # Self-hosted variable fonts (Rubik, Space Grotesk, JetBrains Mono)
├── scripts/          # Build utilities (CSS hashing)
├── nx.json           # Nx workspace config
├── biome.json        # Linter/formatter config
└── package.json      # Root monorepo package
```

## Framework Switcher

Visit the site and use the switcher buttons at the top. The switcher is vanilla JS injected by the Hono shell — it sets a cookie and reloads the page. Each framework renders the same routes with the same content from the same CSS.

## Content

Pages are Markdown files with frontmatter in `packages/content/src/pages/`:

```markdown
---
title: About
slug: about
type: page
description: Senior TypeScript engineer based in Spain.
---

Body content here (rendered as text in page components).
```

The content library exports `getPage(slug)` and `listByType(type)` — consumed at build time by each framework's SSG process.
