# Live availability

The contact page shows a small badge — accent **Available Now**, or a muted
**Booked until …** — and adapts its sub-line to match. The value is real: it is
driven by a source the site owner edits from anywhere, and it propagates to all
three framework builds without a redeploy.

This document covers how the value flows from source to badge, the caching that
keeps it cheap and resilient, and the data-fetching choices made per framework.

## Source: a GitHub gist

The signal lives in a public GitHub gist as `availability.json`:

```json
{ "available": true, "until": "" }
```

`available` toggles the badge; `until` is a free-text date shown only when
booked (`"Booked until August"`). A gist was chosen over the obvious
alternative — reading a "open to work" flag from a professional network — because
no such API exposes that flag, whereas a gist is editable from a phone, versioned,
and costs nothing. The shape is validated by a single Zod schema shared by the
server (which rejects a malformed gist) and the client (which re-validates the
response), so the two can never drift.

## The endpoint: `/api/availability`

A Hono route returns the current value as JSON. It never reads the gist on the
visitor's behalf directly; instead it serves from an in-process cache and
refreshes that cache in the background. The handler is written so it **can never
throw and never hang** — every failure path resolves to a valid value:

- **TTL cache (120s).** A fresh value serves the overwhelming majority of
  requests with no upstream call.
- **Conditional requests (ETag / `If-None-Match`).** Refreshes send the stored
  ETag; a `304 Not Modified` is free against GitHub's rate limit and simply marks
  the value fresh again.
- **Single-flight.** Concurrent refreshes collapse into one upstream request, so
  a burst of traffic can't stampede the gist.
- **Throttled retries.** Outside the TTL, at most one refresh is attempted per
  window, so an upstream outage can't turn into a storm of retries.
- **Stale-on-error.** A failed refresh keeps serving the last good value, logged
  at `warn` (degraded but serving). A failure with *no* cached value to fall back
  on — the blind optimistic fallback — is logged at `error` instead, so alerting
  can distinguish a real outage from a transient blip.
- **Timeout.** An `AbortController` caps the upstream fetch (~3s) so a slow gist
  can't stall the endpoint.
- **Optimistic fallback.** With no value yet (cold start during an outage), the
  endpoint returns `{ available: true }` rather than wrongly turning visitors
  away with a "booked" badge.

An optional `GITHUB_TOKEN` lifts the anonymous rate limit (60/hr → 5000/hr), but
behind the cache and conditional requests the anonymous limit is already ample.

### Why an in-process cache and not Redis

The cache is a module-level value in the Hono process — deliberately *not* Redis
or any external store. The reasons:

- The backend is a **single long-lived process**, so a module-level cache is
  already shared across every request. There is no second instance to coordinate
  with.
- The cached value is tiny and changes rarely; the work is one small fetch every
  couple of minutes at most.
- ETag conditional requests, the HTTP `Cache-Control` on the response, and
  single-flight already drive upstream calls to a trickle. Redis would not reduce
  them.
- Redis would add a deployment target, a connection to manage, and a new failure
  mode — real cost for no benefit at this scale (YAGNI).

The trade-offs are acknowledged and acceptable: the cache is lost on restart (one
cold re-fetch) and is per-instance. Even if the site were ever scaled
horizontally, each instance keeping its own 120-second cache stays comfortably
within limits. This would only be worth revisiting if a hard *shared* rate limit
ever forced cross-instance coordination.

## Reaching the badge without a flicker

The pages are pre-rendered to static HTML at build time, when the live value
isn't known — so the prerender bakes in the optimistic "available" state. At
request time the server patches the served contact page to the real value and
seeds the client, so first paint, no-JS visitors, and the hydrated app all agree:

1. The server reads the cached value and rewrites the prerendered badge and
   sub-line in the HTML (matched by stable `data-availability-*` marker
   attributes), and injects the same value as a JSON `<script>` seed.
2. Each framework reads that seed as the **initial** state of its query, so its
   first client render matches the server markup exactly — no hydration mismatch,
   no visible "available → booked" flip.
3. The query then refetches in the background to stay current.

Angular's hydration is stricter about DOM structure than React's or Vue's, so the
contact component opts out of hydration (`ngSkipHydration`) and re-renders
client-side from the same seeded value: same result on screen, no structural
mismatch, and clean markup for the server to rewrite.

In development there is no static HTML to patch (requests are proxied to the dev
servers), so the badge starts from the optimistic default and corrects after the
first fetch. That brief dev-only flip is intentional and not worth extra
machinery.

## Data fetching: idiomatic per framework

This repo deliberately uses each framework's canonical *form* library
(react-hook-form in React, TanStack Form in Vue). The availability fetch follows
the same principle — each framework uses its own canonical *data* primitive
rather than a lowest-common-denominator hand-rolled `fetch`:

- **React → TanStack Query** (`useQuery`). The de-facto standard for server state
  in React. The seed is supplied as `initialData`; refetch-on-window-focus is a
  built-in default, which is exactly the freshness behaviour wanted here.
- **Vue → TanStack Query** (`@tanstack/vue-query`). Symmetric with the React
  choice and consistent with the TanStack Form already used in the Vue build, so
  Vue tells one coherent "TanStack for forms and data" story. Same `initialData`
  seeding, same focus-refetch default.
- **Angular → `httpResource()`** (`@angular/common/http`). The signal-native
  resource API (Angular 20+), so no extra dependency — just `provideHttpClient`.
  It exposes the response as a signal that a `computed` validates and folds into
  the badge; focus-refetch is wired with a `visibilitychange` listener calling
  `reload()`.

What is deliberately **shared**, regardless of framework, is the part that must
never drift: the Zod schema (validation) and the helper functions that turn a
value into badge and sub-line copy (presentation). The fetching layer is the only
thing that differs, and it differs *on purpose*.

Alternatives weighed for the data layer:

- **One library everywhere (TanStack Query in all three, including the
  experimental Angular adapter).** Consistent, but it would wrap Angular's native,
  signal-based `httpResource()` in a third-party adapter — a dependency where the
  platform already provides the primitive — for no functional gain.
- **Hand-rolled `useEffect` / `onMounted` / service.** Smallest footprint, but
  inconsistent with the form-library choices already in the repo, and it would
  reimplement focus-refetch and caching by hand.
- **Vue-specific options** (Pinia Colada, VueUse `useFetch`). Pinia Colada is a
  fine Vue-native query layer but would pull in Pinia for a single boolean;
  VueUse `useFetch` is a utility rather than a query layer and lacks built-in
  focus refetch. TanStack vue-query won on consistency and built-in behaviour.

## Files

- `packages/shared/src/validation/availability.ts` — shared Zod schema.
- `packages/shared/src/availability-copy.ts` — badge / sub-line copy helpers.
- `packages/shared/src/availability-client.ts` — seed reader + fetch helper.
- `packages/api/src/availability.ts` — the cached, defensive gist reader.
- `packages/api/src/html.ts` — request-time HTML rewrite + seed injection.
- React: `useAvailability.ts`, `query-client.ts`, `pages/Contact.tsx`.
- Vue: `composables/useAvailability.ts`, `pages/Contact.vue`.
- Angular: `availability.service.ts`, `pages/contact.component.ts`.
