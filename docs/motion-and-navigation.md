# Motion and navigation

How the site's two real pages are wired together, how a visitor moves between
them, and how the creative motion layer is built — deliberately CSS-first, with
exactly one scoped runtime enhancement. For the broader rendering strategy see
[`decisions.md`](decisions.md); for the cascade-layer/token setup see
[`css-architecture.md`](css-architecture.md).

## The two pages

The site ships two fully built pages, rendered identically across all three
framework variants:

- **Homepage** — a curated single scroll: hero, a services section (four
  offerings, previously standalone sub-pages, now folded inline), a proof strip,
  a two-post writing teaser, and a closing call-to-action. Each section is its
  own component so the page reads as composition, not one monolith.
- **Timeline** (`/timeline`) — a spatial career timeline: a framework-exposure
  ribbon spanning 2000→present above a spine of roles, each role carrying its
  technologies across four lanes (frontend, backend/DB, CI/CD, AI/LLM), with
  side projects branching off the spine.

Page content and the timeline dataset are **build-time static data** compiled
into JSON and imported directly by each framework — no runtime fetch, so the
three variants hydrate from one identical source of truth.

## Navigation model

Primary navigation is driven by one shared list (`NAV_ITEMS`) so the three
variants — and the two presentations of the nav — never drift:

- **Top bar** (wide viewports) — links sit in the header next to the framework
  switcher and theme toggle.
- **Bottom tab bar** (mobile-first) — a fixed bottom bar with the same three
  destinations (Home, Timeline, Contact), each with an icon, hidden on wide
  viewports where the top bar takes over.

Both render Home / Timeline / Contact from the shared list, mark the active
destination with `aria-current="page"`, and resolve through each framework's
router. A `/blog` placeholder route backs the homepage writing teaser so those
links resolve rather than 404. A shared footer rounds out every page.

Routes are registered **once** in the shared route registry, which also feeds
prerendering, the accessibility scan, and the end-to-end suite — adding a page
is a single edit, not three.

## Motion, CSS-first

The creative layer is delivered almost entirely with platform CSS in one shared
stylesheet (`styles/motion.css`), and every piece is progressively enhanced:
authored behind `@supports` and gated by `prefers-reduced-motion` /
`prefers-reduced-data`, so browsers without support — and visitors who ask for
less motion or less data — always get a correct, fully visible static page.
Content is never trapped in a hidden pre-animation state.

- **Scroll-into-view reveals** — elements marked `[data-reveal]` fade and rise as
  they enter the viewport, via scroll-driven `animation-timeline: view()`. The
  fallback (and the reduced-motion path) is simply the final, visible state.
- **Hero entrance** — the above-the-fold hero animates on load with a small
  stagger (`[data-enter]`), since a scroll reveal would never fire for content
  already in view.
- **Reading-progress bar** — a zero-markup, no-JS indicator pinned under the
  header, driven by `animation-timeline: scroll()`; unsupported browsers just
  show no bar.
- **Page transitions** — moving between the homepage and the timeline is a
  same-document View Transition: the main content slides as a spatial move while
  the shell cross-fades. Each framework hooks its router into
  `startViewTransition` (React's `viewTransition` navigation, a Vue router guard,
  Angular's `withViewTransitions`); browsers without the API navigate instantly.

All of it animates `transform` and `opacity` only, so the motion contributes no
layout shift — the Core Web Vitals budget (LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms)
holds with motion on.

## The one runtime enhancement: scoped smooth scroll

The timeline's assemble-on-enter / disassemble-on-leave choreography reads best
over a smoothed scroll, so the desktop timeline adds [Lenis](https://lenis.darkroom.engineering/)
— and nothing else does. It is centralised in one shared util
(`packages/shared/src/smooth-scroll.ts`) with a thin per-framework lifecycle
hook on the timeline page, and it is scoped hard:

- **Desktop only** — skipped below a width threshold, where native momentum
  scrolling already feels right and touch ergonomics differ.
- **Motion-allowed only** — never initialised under `prefers-reduced-motion`.
- **SSR-safe** — Lenis is loaded with a dynamic `import()` so it never touches
  the server-rendered path, and it is torn down on navigation away.

Because the smooth scroll is the only bespoke runtime motion (alongside the
existing framework-switch "disintegration" effect), cross-variant parity stays
cheap: the CSS motion lives in one stylesheet, and Lenis lives in one util.

## Why not GSAP (yet)

A full GSAP-driven scroll-narrative layer was evaluated and **deliberately
deferred**. The motion this slice needs — reveals, a hero entrance, a spatial
page transition, and one smoothed timeline scroll — is fully served by platform
CSS plus the View Transitions API plus a single scoped dependency, with no
parity cost and no runtime weight on pages that don't need it. GSAP earns its
weight later, on a richer case-study scroll narrative; pulling it in now would
add a bundle and a maintenance surface for motion the platform already does
well. The smaller, sharper choice is the modern one.
