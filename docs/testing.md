# Testing

Tests live where the behaviour lives. The guiding rule: **pure logic runs without a browser; component behaviour runs in a real browser; whole-page behaviour runs end to end.** One Vitest configuration (`vitest.config.ts`) hosts the first two as separate projects; Playwright drives the rest.

> Node: the browser tiers need the version pinned in `.nvmrc`. Run `nvm use` first. Install the browsers once with `bunx playwright install --with-deps chromium`.

## The tiers

| Tier | Runs in | What it covers | Where the test goes |
|------|---------|----------------|---------------------|
| `node` | Node (no DOM) | Pure functions: the contact schema, framework-cookie resolution, content parsing, build helpers | co-located `*.test.ts` |
| `dom` | happy-dom | Logic that touches `document` / cookies / `localStorage` but is **not** a component (theme persistence) | co-located `*.test.ts` |
| `browser-shared` | Chromium | The shared `jb-*` web components (custom elements, shadow/light DOM) | `…/elements/<name>.browser.test.ts` |
| `browser-react` / `browser-vue` / `browser-angular` | Chromium | Framework-native components that carry their own logic | co-located `*.browser.test.{ts,tsx}` |
| accessibility | Chromium + axe | Every live route in every framework variant, at WCAG 2.1 AA | `scripts/a11y-scan.ts` (route list is automatic) |
| end-to-end | Chromium | Whole-app behaviour: framework switch, theme persistence, reduced-motion transition | `tests/e2e/*.spec.ts` |
| visual parity | Chromium | Cross-framework rendering equivalence of shared components | `tests/visual/parity.spec.ts` |
| story checks | Chromium | Per-story accessibility + smoke for the showcase | `@storybook/test-runner` |

## Which test do I write?

- **A pure function, schema, or build helper** → a `node` unit test next to the source. No browser, fastest feedback.
- **Something that reads or writes the DOM/cookies/storage but isn't a component** → a `dom` unit test.
- **A `jb-*` web component** → a `browser-shared` test; the component renders in a real browser so custom elements and shadow DOM behave for real.
- **A React, Vue, or Angular component with its own logic or markup** → a `browser-<framework>` test using that framework's idiomatic tools (Testing Library for React/Vue, `TestBed` for Angular).
- **A thin wrapper that only forwards props/slots/events to a `jb-*` element** → *no dedicated test*. Its behaviour is covered by the showcase accessibility checks and the visual-parity gate. Don't duplicate a suite per framework for pass-through markup.
- **A new page or route** → nothing to wire for accessibility; the scan reads the shared route list. Add an end-to-end test only for new cross-page behaviour.
- **Cross-page behaviour** (navigation, switching, persistence) → an `end-to-end` spec.

The shared web components are the source of truth for shared behaviour, so they get real-browser behaviour tests; framework-native components get their own tests where their logic lives; pass-through wrappers do not. This keeps coverage high without three redundant copies of the same test.

## Running the tests

```bash
bun run test            # everything (unit + component + a11y + e2e + visual + storybook)
bun run test:unit       # node + dom — fast, no browser
bun run test:component   # the four real-browser component projects
bun run test:a11y       # WCAG 2.1 AA scan over every route × framework (needs a prior `bun run build`)
bun run test:e2e        # end-to-end against the production server (needs a prior `bun run build`)
bun run test:visual     # cross-framework visual parity
bun run test:storybook  # per-story accessibility + smoke
```

Scope to one tier while iterating:

```bash
bunx vitest --project node
bunx vitest --project browser-shared
bunx vitest run packages/shared/src/validation/contact.test.ts
```

## Conventions

- **Co-locate** unit and component tests with the code they cover. Cross-cutting suites that need the whole running app (`a11y`, `e2e`, `visual`) live under `tests/`.
- Name component tests `*.browser.test.*` so the non-browser projects never pick them up.
- The accessibility gate is **zero-tolerance at WCAG 2.1 AA** — any violation fails the build.
- Visual snapshots are platform-specific; generate and check them on Linux so they match CI.
- The `a11y` and `e2e` tiers run against the production build (`bun run build` first); CI builds before running them.
