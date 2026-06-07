# Design decisions

Why this site is built the way it is — the libraries chosen, the rendering
strategy, and the alternatives that were rejected along the way. For the runtime
topology and request flow, see [`architecture.md`](architecture.md).

## Why three frameworks, one backend

The site is built three times — React, Vue, and Angular — behind a single
Bun/Hono backend, with a switcher that flips between the live implementations.
Building the same site three ways behind one backend lets each framework's
implementation be read and compared directly, from one content pipeline, one
design system, and one server; only the framework layer changes.

This constraint drives everything below: each framework must pre-render the same
routes from the same content, and the server must serve whichever one the
visitor selected.

## Rendering strategy: build-time SSG + hydration

Every route is **pre-rendered to a static HTML file at build time**, and the
client framework **hydrates** that markup. There is no runtime server-side
rendering and no database — Git is the CMS, and content changes trigger a
rebuild.

**Why SSG over runtime SSR:**

- Per-route static HTML can be served directly with no SPA fallback — optimal
  for SEO (the canonical React build) and trivially cacheable / CDN-friendly.
- No runtime rendering means no per-request compute, no server framework
  runtime to keep warm, and a tiny production server (just file serving).
- The content set is small and author-controlled; nothing needs to render
  per-request.

**Output layout** — each framework writes per-route HTML to its own dist dir,
and Hono serves the one matching the `framework` cookie:

```
dist/<framework>/
├── index.html
├── about/index.html
├── work/index.html
└── assets/  (content-hashed JS + CSS)
```

## Library decisions

Each framework needed a Bun-compatible way to pre-render. The constraint was
**Bun-only, no Node.js runtime** — which ruled out several mainstream options.

### React — custom prerender script (Vite SSR API + `renderToString`)

A small `prerender.ts` iterates the defined routes, imports the content library,
calls React's `renderToString`, and writes per-route HTML. Full control, no
heavy meta-framework. Bun's high Node.js compatibility means Vite's SSR API
works out of the box.

- **Vike (vite-plugin-ssr)** — a full meta-framework; overkill for a static
  portfolio.
- **react-snap** — uses Puppeteer/Chrome; heavy and not Bun-friendly.
- **Next.js** — tied to Node.js and far too much framework for a static site.

### Vue — `vite-ssg` (@antfu)

Declaratively list routes; `vite-ssg` pre-renders them all to static HTML.
Mature, well-maintained, and works under Bun because it's just a Vite plugin —
minimal configuration.

- **Nuxt** — full meta-framework, too heavy for this use case.
- **VitePress** — documentation-focused, not suited to a custom portfolio
  design.
- **Custom script** — viable, but `vite-ssg` already solves it cleanly.

### Angular — AnalogJS (Vite-based, SSG)

Angular was the hardest of the three to fit the Bun-only + SSG constraint, so
its options deserve the most detail.

**Why AnalogJS:**

- **Vite-based — consistent with the other two.** React (Vite SSR API) and Vue
  (vite-ssg) already run on Vite 6. AnalogJS makes Angular the third Vite
  toolchain rather than a bespoke one: the same dev-server model, the same
  config shape, and the shared `serveCssDev` plugin work across all three. That
  consistency is worth as much as Bun support — it keeps the monorepo one
  mental model instead of three.
- **Built on Angular's own SSR primitives.** It uses `@angular/ssr` under the
  hood (a direct dependency), so prerendering and hydration follow Angular's
  supported path rather than a reimplementation.
- **Bun-only, no Node.js runtime.** It's the most mature path that doesn't drag
  in Node as a runtime.
- **Declarative SSG.** File-based routing, declarative prerender config, and
  static-only builds (`--static`), which Angular 21's zoneless change detection
  makes work smoothly.

**Alternatives considered:**

- **Angular CLI / `@angular/build` application builder (official
  prerendering).** Angular ships first-party SSG (prerender) via `@angular/ssr`
  and the application builder. Rejected as the *driver* because the CLI still
  uses Node.js as its runtime and isn't Vite-based — it would make Angular the
  odd one out in an otherwise Vite/Bun monorepo. (AnalogJS still builds on the
  underlying `@angular/ssr` primitives, so this isn't thrown away — just driven
  by Vite instead of the Node CLI.)
- **Scully** — the long-standing Angular static-site generator. Rejected: it is
  effectively unmaintained and superseded by Angular's own prerendering, and it
  assumes a Node/Angular-CLI pipeline.
- **Bung** (kream0/bung) — proof-of-concept (1 commit); shows Bun feasibility
  but not production-ready.
- **Custom esbuild scripts** — maximum control, but would mean reinventing
  routing, SSG, and hydration by hand.

## Tooling decisions

### Monorepo — Nx with Bun as package manager

Nx orchestrates task running and caching across the four packages and parses
`bun.lock`. Bun is the package manager and script runtime; Nx orchestrates the
targets (Vite, AnalogJS, Biome) rather than running them through a Node runtime.

- **Turborepo** — comparable, but less mature TypeScript path-alias management.
- **Bun workspaces alone** — no task caching, no affected commands, manual build
  ordering.
- **@nx-bun plugin** — experimental, not production-ready.

Gotchas worth knowing: use the text-based `bun.lock` (not binary `bun.lockb`),
disable `@nx/dependency-checks` (false positives under Bun), and note that CI
needs a custom Bun setup (default Nx Cloud agents assume npm/pnpm/yarn).

### Content — TypeScript module, gray-matter, Git as CMS

Content is Markdown with frontmatter under `packages/content/`. A plain
TypeScript module parses it with gray-matter and exposes lookup functions
consumed **at build time** by each framework's prerender step. No runtime API,
no database — Git is the CMS, and a content change is just a rebuild.

### Data fetching — idiomatic per framework

The one piece of genuinely dynamic data (the live availability badge) is fetched
with each framework's canonical data primitive — TanStack Query in React and Vue,
the signal-native `httpResource()` in Angular — mirroring the per-framework *form*
library choices. The schema and copy helpers are shared; only the fetching layer
differs, on purpose. Full rationale, including the alternatives weighed and the
in-process-cache-not-Redis decision, is in
[`availability.md`](availability.md).

### Client interaction state — idiomatic per framework, platform persistence

The timeline's tech pills are toggle filters: click a pill to filter the timeline to
roles carrying that technology (AND across active pills), and non-matching rows dim in
place. The point is to show the *same* cross-cutting reactive-state problem solved
idiomatically three ways, so the state is held with each framework's native primitive
rather than a store library:

- **React** — a `useReducer` over a `Set`, shared through Context hosted at the layout
  level (so a selection survives navigating away and back); deep pill buttons read and
  toggle it via a hook, no prop-drilling.
- **Vue** — a module-level `ref<Set>` composable, a singleton for the app's lifetime
  (the Set is replaced on each write, since mutating it in place is not reactive).
- **Angular** — a root-provided signal service; pill components inject the same instance
  and derive their dimming from a `computed`.

No Redux/Zustand/Pinia/NgRx: a single ephemeral Set scoped to one view does not earn a
store, and TanStack Query already demonstrates a state library where it genuinely fits
(see *Data fetching* above). Each derives a per-row "dimmed" boolean reactively, and the
pills are real `<button aria-pressed>` toggles so the filter is keyboard- and
screen-reader-correct; dimming is visual only (a CSS `filter`, never `display:none`), so
dimmed rows stay in the accessibility tree.

Persistence spans three navigation hops, handled by the web platform rather than a
library. The active filter mirrors to the **URL query** (`?tech=react,docker`) via
`History.replaceState` — a history rewrite, deliberately *not* a router navigation:
toggling a filter is a state change, so routing it would needlessly push history, re-run
guards/view-transitions, and (with each framework's scroll restoration) jerk the page to
the top. The same value also mirrors to **`sessionStorage`**, which — being shared
per-origin — carries the selection across a framework switch (React → Vue → Angular is a
cookie set plus a full reload into a different app). On mount the state seeds after
hydration (so the first client render matches the unfiltered prerender): the URL query
wins when present, else the persisted value. The shared matching, serialisation, and
History/storage glue live in one framework-agnostic module; only the reactive state
binding differs.

### Observability — Grafana, banner-free

Backend logs (pino → Grafana Cloud Loki) and frontend RUM (Grafana Faro, run
sessionless and proxied through the backend) land in one Grafana surface, designed
to need no consent banner. The reasoning — Faro over a hand-rolled beacon, why the
proxy, and why sessionless removes the banner — is in
[`frontend-telemetry.md`](frontend-telemetry.md).

### API documentation — code-first OpenAPI

The JSON API describes itself with an OpenAPI 3.1 document generated from the route
contracts via `hono-openapi`. It is code-first rather than reflective: each route is
annotated with the same Zod schemas the handlers and browser forms already use
(`contactSchema`, `availabilitySchema`), so the published spec cannot drift from what
the server accepts and returns. The document is served live at `/api/openapi.json`,
with a Scalar reference UI at `/api/docs` reading from that same path — there is no
checked-in artifact to keep in sync; extracting the spec is just a GET against a
running server. Validation behaviour is untouched: the routes are *described*, not
re-validated through the library's middleware, so the existing responses are
unchanged.

- **`@hono/zod-openapi`** — official, but rewrites every route into its `createRoute`
  builder and pins to an older Zod major; `hono-openapi` speaks Standard Schema, which
  Zod 4 implements natively, so the existing schemas wire in directly.
- **Hand-assembled spec** — possible with Zod 4's `z.toJSONSchema`, but more to
  maintain and easy to let drift from the live routes.

### API abuse controls — in-process middleware

The public JSON endpoints are protected by a small middleware layer rather than a
token: the clients are anonymous browsers, so a token would have to ship in the
frontend bundle and wouldn't be a secret. Instead each route carries a per-IP rate
limit (strict on contact, generous on the chatty telemetry proxy), the POST routes
carry a body-size cap, and the first-party RUM proxy additionally requires a
same-origin request. Counters live in an in-process store — correct for a single
container and consistent with the in-process availability cache; behind multiple
replicas the limits would be per-instance, a deliberate non-goal. The client address
is resolved from a trust-aware helper that, by default, does **not** believe
`X-Forwarded-For` — a forged header from a direct caller would otherwise bypass the
limiter. It prefers a configured edge header (`CLIENT_IP_HEADER`, e.g.
`cf-connecting-ip`), trusts `X-Forwarded-For` only when the number of fronting
proxies is declared (`TRUSTED_PROXY_HOPS`, taking the entry the outermost trusted
proxy appended), and otherwise uses the socket address. The new `403`/`413`/`429`
outcomes are part of each route's OpenAPI description, so the published spec still
matches reality.

---

These decisions are distilled from the project's internal research notes and
verified against the scaffold. The creative motion layer — scroll reveals, the
hero entrance, same-document View Transitions, and a scoped Lenis smooth scroll
on the desktop timeline — now ships; how it is built, and why the broader GSAP
layer stays deferred, is covered in
[`motion-and-navigation.md`](motion-and-navigation.md).
