# Component showcase

An interactive catalogue of the design system, rendered in **React**, **Vue**, **Angular**, and
as the shared native **web components** — federated into one browsable site and deployed to
[components.fortunatogeelhoed.com](https://components.fortunatogeelhoed.com).

Each technology has its own Storybook; a thin composition root links them together so the whole
catalogue loads from one place. See [component-showcase-architecture.md](./component-showcase-architecture.md)
for why it is built this way.

## Run it locally

```bash
bun install
bun run storybook            # the composition portal on http://localhost:6006
```

The portal references each section's dev server. To work on a single section, run it directly:

```bash
bun run storybook:web-components   # the Lit jb-* elements   (:6007)
bun run storybook:react            # React                   (:6008)
bun run storybook:vue              # Vue                     (:6009)
bun run storybook:angular          # Angular                 (:6010)
```

To browse the fully composed catalogue exactly as it ships:

```bash
bun run build-storybook            # assembles dist/storybook
bun run serve-storybook            # serves it on http://localhost:6006
```

## Add a component example

Stories use [Component Story Format](https://storybook.js.org/docs/api/csf). Add a `*.stories.*`
file next to the component and title it `<Technology>/<Component>` so it groups correctly:

| Technology      | Location                                   | Renderer                       |
| --------------- | ------------------------------------------ | ------------------------------ |
| Web components  | `packages/shared/src/elements/*.stories.ts`| Lit templates                  |
| React           | `packages/react/src/components/*.stories.tsx` | JSX                         |
| Vue             | `packages/vue/src/components/*.stories.ts` | SFC import or `h()` render     |
| Angular         | `packages/angular/src/components/*.stories.ts` | component + template       |

That single file is the only change needed — the section picks it up automatically.

### Web-component documentation

The `jb-*` elements' property/event/slot tables and controls are generated from a
[Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest). After
changing an element's API, regenerate it:

```bash
bun run cem                  # writes packages/shared/custom-elements.json
```

(The `storybook` and `build-storybook` scripts run this automatically.)

## Verify

```bash
bun run test:visual          # cross-framework visual-regression parity (Playwright)
bun run test:storybook       # per-story accessibility + smoke (point at one section via TARGET_URL)
bun run lint                 # Biome
```

The parity check renders the Contact Form in React, Vue, and Angular and compares them against a
single baseline with the per-framework accent normalized, so any drift fails the build. To
refresh baselines after an intentional visual change:

```bash
bun run test:visual -- --update-snapshots
```

## Deploy

Pushing to `main` triggers the **Component Showcase** workflow, which builds the composed tree,
runs the parity gate, and publishes to GitHub Pages. The build is fail-loud: if any one section
fails to build, nothing is published. Serving from the sub-domain root means no base-path
configuration is required.
