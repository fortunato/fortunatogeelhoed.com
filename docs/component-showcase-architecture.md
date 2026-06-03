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

## The Vite three vs. the Angular one

React, Vue, and the web components run on Storybook's Vite builder, reusing each package's own
Vite configuration (aliases, the lightningcss-based CSS pipeline) so the showcase matches the
site. Vue's SFC composites use `<jb-*>` tags, so the Vue section swaps in a Vue plugin configured
with `isCustomElement` — exactly as the live app does — so those tags compile to native custom
elements rather than being mistaken for Vue components.

Angular is the one exception: `@storybook/angular` uses Angular's own (webpack-based) builder,
not the AnalogJS Vite path the site uses. There is no first-party Vite builder for Angular
Storybook, and forcing a community one is fragile. The cost is accepted — Angular is the heaviest
build — and its global styles, the `zone.js` polyfill, and its tsconfig come from a Storybook-only
build target in `angular.json`. This is the reason the build order and tooling differ for Angular.

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

The elements deliberately show both encapsulation modes, and the showcase preserves that:
`jb-input` / `jb-textarea` / `jb-theme-toggle` use light DOM (styled by the global stylesheet and
inherited `--jb-` tokens, and form-associated for native validation), while `jb-tech-tag` uses
shadow DOM, kept on-palette purely through inherited custom properties.

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

## Patched dependencies

One dependency is patched: `@angular-devkit/build-angular` (via bun's `patchedDependencies`, with
the diff committed under `patches/`). The patch adds a single option — `modules: false` — to the
css-loader used for Angular **component** styles.

Why it's needed: `@storybook/angular` is webpack-based, and Angular compiles a component's
`styleUrl` inside its own child compilation, where the css-loader is configured with
`exportType: 'string'` and `esModule: false` but no `modules` setting. css-loader then falls back
to its default `modules.auto`, which treats any `*.module.css` file as a CSS Module requiring
named ES exports — incompatible with the string export, so the build throws. The site header's
`styleUrl` points at the shared `header.module.css` (named with the React/Vue CSS-Module
convention), so the Angular header tripped this. The loader lives in Angular's child compilation,
so it can't be reached from Storybook's `webpackFinal`, and the file can't be renamed without
breaking the React/Vue variants that import it as a real CSS Module.

Why `modules: false` is correct, not a hack: Angular scopes component styles via
ViewEncapsulation, never via CSS Modules, so component styles should never be module-processed —
the option Angular omits is one it should arguably set. The patch only affects the webpack build
path that `@storybook/angular` uses; the live site builds through AnalogJS/Vite and is unaffected.

Maintenance: the patch is pinned to the exact version (`@angular-devkit/build-angular@21.2.13`).
On a version bump, bun re-applies the diff and fails loudly if it no longer applies cleanly — at
which point regenerate it with `bun patch @angular-devkit/build-angular`, re-add `modules: false`,
and `bun patch --commit`. A future `@storybook/angular` esbuild/Vite builder would remove the need
for the patch entirely.

## Boundaries

The showcase is a separate artifact. It does not change the live site's routing, content, or the
framework switch, and it reuses the existing design tokens, stylesheet, and accessibility
commitments rather than restyling anything.
