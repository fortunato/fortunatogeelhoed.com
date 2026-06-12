# The writing area

How articles get from a Markdown file to three identical, statically rendered pages with their own
search and social metadata. This is the deliberate shape of the feature, not an accident of
whichever framework rendered it.

## Source of truth

Each article is one Markdown file in `packages/content/src/posts/<slug>.md` with frontmatter:

```markdown
---
title: Too React
slug: too-react
type: post
date: 2026-06-11
tag: Build
description: One or two sentences, used as the card blurb and the meta description.
draft: false
---

Body in Markdown. Headings, lists, links, > blockquotes, `inline code`, fenced code, images.
```

Version control is the store. There is no database and no runtime editing: publishing an article
means committing the file and rebuilding. `draft: true` keeps a piece out of every public surface
(index, homepage teasers, sitemap) while still letting it be previewed locally.

## Build-time rendering

`@fg/content` renders each article once, at build time:

- `render.ts` runs the body through `markdown-it` (`html: false`, so raw HTML in source is escaped;
  `typographer: false`, so it never rewrites `--` or `...` into typographic glyphs) plus
  `markdown-it-anchor` for stable heading ids. It also estimates reading time (words / 220, min 1).
- `listPosts()` returns the published, non-draft articles, newest first, each with its rendered
  `html` and derived fields.
- `scripts/build-content.ts` writes `packages/content/posts.json` (`{ published: Article[] }`),
  resolves each article's social image, and derives the homepage "Latest writing" teasers from the
  newest articles (with an optional pinned-slug override).

Rendering once, here, is what keeps the three framework renders byte-identical: every frontend
injects the same HTML string.

## Routing and prerender

`/writing` is a normal content page (its intro copy lives in `pages/writing.md`). `/writing/<slug>`
is a dynamic article route. Article paths are not added to the static route table; they are derived
from `posts.json` via `articlePathsFromPosts(published)` and fed into each framework's prerender so
every article is emitted as static HTML:

- React: a loop in `packages/react/prerender.ts`.
- Vue: `ssgOptions.includedRoutes` in the Vue Vite config.
- Angular: the article paths are rendered by the prerender step in `packages/angular/prerender.ts`.

`/blog`, the section's previous path, is a permanent (301) redirect to `/writing` in the Hono server
so older links and any prior indexing do not dead-end.

## Styling: the `.prose` wrapper

Article body typography lives in `styles/components/prose.module.css`: a single `.prose` wrapper with
element selectors, semantic `--jb-*` tokens only (so light and dark theming come for free), and no
`@layer` wrapping (unlayered, like every component module, so it out-specifies the global element
rules without `!important`). React and Vue consume it as a CSS module; the hashed `.prose` class plus
descendant selectors style the injected body.

Angular needs one extra step. The article body is injected as trusted HTML (`bypassSecurityTrustHtml`
+ `[innerHTML]`), so it carries no `_ngcontent` attribute, and Angular's emulated view encapsulation
would scope `.prose a` to `[_ngcontent]` and never match it. The article component therefore uses
`ViewEncapsulation.None`. That is safe because every rule in the stylesheet is scoped under `.prose`,
so the styles only ever apply to an article body. The accessibility gate (`bun run test:a11y`, which
now covers the article routes) is what enforces this parity: without the encapsulation change, the
Angular article body fails the "links must be distinguishable without color" check while React and
Vue pass.

## Search and social

`@fg/shared` stays content-free; the prerender passes each article's data into the SEO helpers:

- `renderArticleSeoHead` emits a per-article title, description, canonical (`/writing/<slug>`),
  Open Graph (`og:type=article` with the per-article image), Twitter card, and a `BlogPosting`
  JSON-LD that references the existing Person as author. React, the canonical indexed render, carries
  the full block; Vue and Angular carry title, description, canonical, and the Open Graph tags
  through their native head mechanisms.
- `isIndexedPath` treats `/writing` and every `/writing/<slug>` as indexable; the sitemap is
  data-driven from `posts.json`.
- Social images are generated per article at build time (`scripts/build-og-images.ts`, satori plus a
  WASM rasteriser) into `static/og/<slug>.png`, served at `/assets/og/<slug>.png`. Generation is
  wrapped so any failure logs a warning and falls back to the site default image, never failing the
  build.

## Adding an article

1. Write `packages/content/src/posts/<slug>.md` with the frontmatter above (no em dashes in the body).
2. `bun run build:content`, then `bun run dev:react` (or `dev:vue` / `dev:angular`) and visit
   `/writing/<slug>`.
3. Switch frameworks in the header to confirm parity; toggle light/dark to confirm legibility.
4. `bun run build` regenerates the social image, the sitemap, the homepage teasers, and the
   prerendered pages.
