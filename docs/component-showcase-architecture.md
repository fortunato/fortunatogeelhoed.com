# Component showcase — architecture & rationale

Why the showcase is built the way it is. For day-to-day commands see
[component-showcase.md](./component-showcase.md).

## Goal

Make the cross-framework claim verifiable. The site renders the same design system three ways
(React, Vue, Angular) on top of a set of shared web components. The showcase lets anyone open
one URL and confirm, hands-on, that the same components and tokens hold across all of them.

## One Storybook per technology, composed into one site

A Storybook instance is bound to a single renderer, so there is one instance each for React,
Vue, web components, and Angular. A thin **composition root** (`/.storybook`) owns no component
stories — only the introduction page — and references the four via `refs`.

The refs are **relative, same-origin paths** (`./react`, `./vue`, …). The four sections are
assembled as sibling folders under one published tree, so the composed catalogue loads entirely
from one origin. This is deliberate: a static host such as GitHub Pages cannot set CORS headers,
so cross-origin composition would break. Same-origin composition needs none. Composition happens
at the URL layer — the portal links to the sections, it does not bundle them — so each section
stays an independent build and assembly is a plain file copy.

In development the same refs point at each section's local dev server instead, so the portal can
compose live.

## One builder for all four sections

Every section runs on Storybook's Vite builder, reusing its package's own Vite configuration
(aliases, the lightningcss-based CSS pipeline) so the showcase matches the site, and every section
loads the same global stylesheet and registers the shared web components through
`.storybook/preview-shared.ts`.

Vue's SFC composites use `<jb-*>` tags, so the Vue section swaps in a Vue plugin configured with
`isCustomElement` — exactly as the live app does — so those tags compile to native custom elements
rather than being mistaken for Vue components.

The Angular section uses AnalogJS's Storybook framework (`@analogjs/storybook-angular`), which
compiles Angular through `@analogjs/vite-plugin-angular`: the same compiler path the live site
builds with. Its config mirrors `packages/angular/vite.config.ts` (aliases, lightningcss with CSS
Modules off, so a shared `*.module.css` used as a `styleUrl` stays plain CSS that
ViewEncapsulation scopes), keeps zone.js change detection like the app, and imports `zone.js` in
its preview. Because all four sections build the same way, the showcase build runs them all with
the same `storybook build` command, and `@storybook/addon-vitest` can test every section's stories.

## The shared web components are the integration point

The `jb-*` elements (built with Lit) are the real primitives; the frameworks **consume** them
rather than reimplementing them. So the catalogue shows each element once natively in the Web
Components section, and again consumed inside a framework-authored composite (the Contact Form).
The form is the better demonstration than a bare element: each framework consumes the same
`jb-*` controls through its own **modern forms stack** — `react-hook-form` in React, TanStack
Form in Vue, and Angular's **Signal Forms** (`@angular/forms/signals`) — binding to each element
via its `value` property and bubbling native `input`/`blur` events. That shows real interop in
context (controlled values, native events, validation, a `disabled` state, per-field errors)
rather than a bare mount, and exercises each framework's current forms idiom.

### One validation schema, every framework and the server

All three forms — and the API that receives the submission — validate against a **single Zod
schema**, `packages/shared/src/validation/contact.ts`. Each framework feeds that one schema into
its forms stack through a standard interface: React via `zodResolver`, Vue and Angular via the
[Standard Schema](https://standardschema.dev) interface (`validators` / `validateStandardSchema`).
On submit, each form POSTs to the Hono `/api/contact` endpoint, which re-validates with the same
`contactSchema.safeParse` and is authoritative; any server-side field errors are mapped back onto
the form. The validation rules therefore live in exactly one place and the clients and server can
never drift apart — and the same contract is expressed through three different idiomatic forms
stacks, which is itself a cross-framework mastery signal.

The site header (with the primary nav) is also showcased as a framework-authored composite in
all three frameworks. It is intentionally excluded from the visual-parity gate because the active
framework-switcher button differs per section by design. The Angular header required working
around an upstream bug — see "Patched dependencies" below.

The web components are the framework-agnostic, stateful/form-associated primitives:
`jb-input` / `jb-textarea` / `jb-theme-toggle` use light DOM (styled by the global stylesheet and
inherited `--jb-` tokens, and form-associated for native validation), and `jb-icon` is a light-DOM
glyph. Inert presentational labels are intentionally *not* web components — tags/badges are a pure
CSS class layer (`.tag`); see the CSS architecture doc.

Registration is an explicit `registerElements()` call in each section's browser-only preview —
never a build-time import, because the shared barrel is also imported in Node during prerender,
where the element classes (which extend `HTMLElement`) cannot be evaluated.

## Generated documentation

Web components have no framework prop-types to introspect, so their property/event/slot tables
and controls come from a Custom Elements Manifest generated from the element sources. The
elements carry `@customElement`/`@fires`/`@slot` JSDoc so the analyzer can map each class to its
tag and API.

## Theming

Every section reuses the site's real theme mechanism: a toolbar toggle drives the same
`data-theme` attribute and `--jb-` tokens, persisted via the same cookie/localStorage helper. The
Web Components section uses a brand-neutral accent (the elements are framework-agnostic) rather
than inheriting the global default accent, which is React's.

## Parity is enforced, not asserted

Cross-framework parity is gated by Playwright visual-regression against the built static tree.
The Contact Form is rendered in React, Vue, and Angular and compared to a single shared baseline
with the per-framework accent normalized — so the comparison proves the design system renders
identically while ignoring the legitimate accent difference. Drift fails the build.

## Fail-loud publishing

The build orchestrator builds all four sections plus the portal and assembles them into one tree
only after every build succeeds; any failure exits non-zero and the deploy step does not run, so
a partial catalogue that misrepresents coverage can never ship. The tree is published to GitHub
Pages on a sub-domain served from root (a `CNAME`), which removes any base-path handling, with a
`.nojekyll` marker so Storybook's underscore-prefixed asset folders are served untouched.

## Boundaries

The showcase is a separate artifact. It does not change the live site's routing, content, or the
framework switch, and it reuses the existing design tokens, stylesheet, and accessibility
commitments rather than restyling anything.
