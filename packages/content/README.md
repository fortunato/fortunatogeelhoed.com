# @fg/content

The single source of content for all three framework apps. Nothing here renders;
the package exposes typed accessors, and the build step (`scripts/build-content.ts`)
serializes their output to JSON that React, Vue, and Angular read at pre-render time.

## Three content shapes

Content lives in one of three forms, chosen by its shape, not by which page it
belongs to.

**Prose pages → Markdown (`src/pages/*.md`)**

Whole-page copy that reads as flowing text: `about`, `work`, `services`, `writing`,
`contact`, `home`. Each file is gray-matter frontmatter (`title`, `slug`, `type`,
`description`, optional `date`/`draft`) followed by a Markdown body. `parser.ts`
turns a file into a loosely-typed `ContentItem`; `index.ts` exposes `getPage`. Add a
page by dropping in a new `.md` file and wiring a route with a matching `contentSlug`.

**Articles → Markdown (`src/posts/*.md`)**

Blog articles, surfaced at `/writing` (the index) and `/writing/<slug>` (each
article). Same gray-matter frontmatter as a page plus a single topic `tag`, with
`type: post`. Unlike a prose page, an article's Markdown body is rendered to HTML at
build time (`render.ts`, markdown-it) and the reading time is computed, producing an
`Article` (`ContentItem` plus `tag`, `html`, `readingMinutes`, `ogImage`). `index.ts`
exposes `listPosts()` (published, non-draft, newest first). The newest articles also
feed the homepage teasers and the sitemap. `draft: true` keeps an article out of every
public surface. Add an article by dropping in a new `.md` file; no route wiring is
needed (the article routes are derived from the published list at build time).

**Structured records → TypeScript (`src/home.ts`, `src/timeline.ts`)**

Relational data that would be awkward and error-prone as prose: the career
`timeline` (per-entry years, employment type, nested per-category tech lists) and
the homepage model (`hero`, `services`, `proof`, `writing`, `cta` arrays). These
are plain typed objects checked against `HomeContent` / `TimelineData` from
`@fg/shared`, returned by `getHomeContent()` and `getTimeline()`. Edit the data in
place; the type checker guards the shape.

Rule of thumb: if the content is paragraphs a human writes, it's Markdown (a prose
page, or an article if it belongs in the writing section). If it's a list of records
with fields the apps index into, it's a typed `.ts` module.

> Note: `home` currently exists in both worlds. `home.md` carries page metadata
> and a short body; `home.ts` carries the structured homepage the apps actually
> render. The `writing` teasers in `home.ts` are placeholders: the build overrides
> them with the newest published articles.

## Build outputs

`bun run build:content` writes JSON files into the package root, which the apps
import directly:

- `data.json` — every routed Markdown page, keyed by slug.
- `home.json` — the serialized `HomeContent` (with the writing teasers resolved to the newest articles).
- `posts.json` — `{ published: Article[] }`, every published article with its rendered HTML.
- `timeline.json` / `timeline-page.json` — the serialized career timeline and its page copy.
- `frontend-frameworks.json` / `backend-frameworks.json` — the framework-exposure data.

These are build artifacts, regenerated on every build.

## Layout

```
src/
  pages/        prose pages (*.md)
  posts/        blog articles (*.md), rendered to HTML at build time
  home.ts       structured homepage data
  timeline.ts   structured career timeline
  parser.ts     frontmatter → ContentItem / Article
  render.ts     Markdown → HTML (+ reading time)
  index.ts      public accessors
  case-studies/ services/   reserved for future Markdown collections (empty)
```
