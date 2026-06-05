# @fg/content

The single source of content for all three framework apps. Nothing here renders;
the package exposes typed accessors, and the build step (`scripts/build-content.ts`)
serializes their output to JSON that React, Vue, and Angular read at pre-render time.

## Two content shapes

Content lives in one of two forms, chosen by its shape — not by which page it
belongs to.

**Prose pages → Markdown (`src/pages/*.md`)**

Whole-page copy that reads as flowing text: `about`, `work`, `services`, `blog`,
`contact`, `home`. Each file is gray-matter frontmatter (`title`, `slug`, `type`,
`description`, optional `date`/`draft`) followed by a Markdown body. `parser.ts`
turns a file into a loosely-typed `ContentItem`; `index.ts` exposes `getPage`,
`getPost`, `listPosts`, and `listByType`. Add a page by dropping in a new `.md`
file and wiring a route with a matching `contentSlug`.

**Structured records → TypeScript (`src/home.ts`, `src/timeline.ts`)**

Relational data that would be awkward and error-prone as prose: the career
`timeline` (per-entry years, employment type, nested per-category tech lists) and
the homepage model (`hero`, `services`, `proof`, `writing`, `cta` arrays). These
are plain typed objects checked against `HomeContent` / `TimelineData` from
`@fg/shared`, returned by `getHomeContent()` and `getTimeline()`. Edit the data in
place; the type checker guards the shape.

Rule of thumb: if the content is paragraphs a human writes, it's Markdown. If it's
a list of records with fields the apps index into, it's a typed `.ts` module.

> Note: `home` currently exists in both worlds. `home.md` carries page metadata
> and a short body; `home.ts` carries the structured homepage the apps actually
> render. If the Markdown body goes unused, fold it into the route metadata and
> drop the file.

## Build outputs

`bun run build:content` writes three JSON files into the package root, which the
apps import directly:

- `data.json` — every routed Markdown page, keyed by slug.
- `home.json` — the serialized `HomeContent`.
- `timeline.json` — the serialized `TimelineData`.

These are build artifacts, regenerated on every build.

## Layout

```
src/
  pages/        prose pages (*.md)
  home.ts       structured homepage data
  timeline.ts   structured career timeline
  parser.ts     frontmatter → ContentItem
  index.ts      public accessors
  case-studies/ posts/ services/   reserved for future Markdown collections (empty)
```
