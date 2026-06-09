# Frontend telemetry and observability

Real-user monitoring (errors and Web Vitals from actual visitors) flows into
Grafana, and backend logs flow alongside it — both on free tiers, both designed
to be privacy-first and, importantly, **without a consent banner**. This document
records the approach and, more usefully, *why* it is shaped this way.

> Not legal advice. The reasoning below reflects how the design was decided;
> confirm specifics for your jurisdiction (this site is operated from the EU).

## Goal and priorities

Capture frontend errors and Web Vitals from real visitors in Grafana's
purpose-built UI, with a deliberately strict privacy posture. The traffic is
light, so the priorities are ordered for privacy over data volume:

1. **Never trigger a consent banner.** This is a hard constraint, not a
   preference: anything that would require a consent prompt is off the table, even
   if it would yield richer data.
2. **Stay privacy-first** — collect no personal data that would require consent,
   on a legitimate-interest basis with a privacy note.
3. **Then** collect whatever useful frontend signal fits inside those two
   constraints.

Every decision below follows from that order: where a richer Faro feature would
cross constraint 1 or 2, it is dropped rather than gated behind consent.

## Frontend RUM: Grafana Faro, sessionless, proxied

The browser sends errors and Web Vitals via the **Grafana Faro Web SDK**. Three
deliberate constraints shape the integration:

- **Sessionless.** Session tracking is disabled, so Faro generates and stores no
  session identifier. Nothing is written to cookies, `localStorage`, or
  `sessionStorage`.
- **Minimal.** Only the errors and Web Vitals instrumentations are loaded — no
  console, view, or session instrumentation, and not the heavier tracing add-on.
- **First-party and proxied.** Faro posts to our own `/api/rum` endpoint, never to
  Grafana directly. The Hono proxy strips identifiers, hides the collector key on
  the server, and forwards the payload. Because the forward originates from the
  server, Grafana sees the *server's* IP, never the visitor's.

The SDK is loaded lazily (after `load`, when the browser is idle) so it never
competes with the page's own Web Vitals, and it is skipped entirely when the
visitor sends Do Not Track or Global Privacy Control.

### Why Faro over a hand-rolled beacon

A few lines of `navigator.sendBeacon` could ship metrics to a generic store. Faro
was chosen because it populates Grafana's **Frontend Observability** app — the
purpose-built RUM UI — out of the box, is the officially supported SDK, and
collects Web Vitals correctly without bespoke code. The beacon is leaner but
reinvents Faro badly and doesn't feed the RUM app, which was the whole point.

### Why proxy through our own endpoint

Pointing Faro at `/api/rum` instead of Grafana's collector keeps the request
**first-party**: there is no third-party endpoint for an ad-blocker to drop, the
collector key stays on the server, and — the privacy win — the visitor's IP is
stripped simply because the forward is made by the server. (A side effect: any
IP-derived geolocation reflects the server's location, not the visitor's. That is
acceptable, and arguably a privacy positive.)

### Why sessionless — and why that removes the banner

This is the crux of the decision, and it rests on separating two different rules:

- **The ePrivacy rule** governs *storing or reading information on the visitor's
  device* — but only requires consent when that storage is **not strictly
  necessary for a service the visitor explicitly requested**. Genuine
  user-preference storage is exempt. That is why this site's theme choice (kept in
  a cookie *and* localStorage) needs no banner: the visitor actively chose it and
  the storage exists solely to deliver the functionality they asked for. An
  analytics/RUM **session identifier is not exempt** — it exists for the
  operator's measurement, not for the content the visitor requested — so it would
  require consent. A proxy can't change this either way, because the storage lives
  in the browser, not on the wire.
- **The GDPR rule** is triggered by *processing personal data* (an IP address is
  personal data), and is a separate axis: it applies regardless of device storage.
  The proxy addresses this side by stripping the IP.

The two are orthogonal, which is why two different levers are needed. Stripping
the IP handles the GDPR axis; running **sessionless** handles the ePrivacy axis by
never creating the non-exempt identifier in the first place. The theme storage
sidesteps ePrivacy not by avoiding storage but by qualifying for the
strictly-necessary exemption.

So the proxy fixes the network/personal-data side, but only **removing the stored
identifier** fixes the on-device-storage side. Running Faro sessionless means
nothing is stored on the device, so the ePrivacy storage trigger never fires;
combined with the IP stripping, the design processes no personal data that needs
consent. With no consent required, there is no banner to show. The remaining
processing rests on **legitimate interest** (basic, aggregate site health), noted
in the site's privacy text.

It is worth being precise about what consent *is*, since "just add a banner" is
the usual reflex. Valid consent under GDPR must be freely given, specific,
informed, an unambiguous affirmative action, and as easy to withdraw as to give.
Cookie walls, pre-ticked boxes, and "by using this site you agree" are **not**
valid consent. A banner done properly is friction for the visitor and a
compliance surface for the owner — avoiding the need for one entirely is the
better outcome, not a shortcut.

### Trade-off

Sessionless means no cross-pageview session stitching — you see individual
errors and vitals, not a reconstructed user journey. For a portfolio that is a
fine trade, and it follows directly from the priority order above: session
stitching needs a stored identifier, which would require consent and therefore a
banner, which constraint 1 rules out. Enabling it would be a one-line config
change, but it is deliberately *not* done because it crosses the hard constraint —
not because it is hard to do.

## Backend logging: pino to Grafana Cloud (Loki)

The Hono server logs structured JSON with **pino**. The firm rule is that
**stdout is always the source of truth and can never fail** — shipping logs to a
hosted store is layered on top and is strictly optional. In production, when Loki
credentials are present, a `pino-loki` transport batches log lines to Grafana
Cloud's managed Loki; locally, or when credentials are absent, the server simply
logs to stdout and is otherwise unaffected. A shipping outage drops logs, never
requests. Loki was chosen for the same reasons as Faro: a generous free tier and a
single, familiar Grafana surface for both backend logs and frontend RUM.

## Source maps: de-obfuscating production errors

Production JavaScript is minified, so a Faro error stack trace points at unreadable
positions. Uploading each build's source maps to Grafana lets the Frontend
Observability UI resolve those traces back to original `.ts`/`.tsx`/`.vue` source.
The maps are uploaded to Grafana, never served from the site.

### One app, three frameworks, per-build bundle ids

The three frontends report to a single Faro application (`fortunatogeelhoed.com`);
the framework is carried as the app *namespace* (`react`/`vue`/`angular`), so one
collector and one app cover all three while staying distinguishable in Grafana.
De-obfuscation does not match on the app name: it matches on a **bundle id**, a
per-build identifier injected into the JavaScript and attached to every error. Each
framework's build emits its own bundle id (`<framework>-<release>`), so a React
error resolves against React's maps even though all three share one app name.

### Build and publish are separate phases

Producing the maps and publishing them are kept apart, mirroring the build/deploy
split used for the server:

- **Build (no secret, no network).** During the release image build each client
  build emits hidden source maps (no `sourceMappingURL` comment) and injects its
  bundle id. It does not upload. The maps are then moved out of the served tree, so
  the runtime image ships the bundle ids but none of the maps.
- **Publish (release only, best-effort).** A separate CI job exports the maps from
  the build and uploads them to the Faro source map API, once per framework under
  its explicit bundle id. It never blocks the deploy: a failed upload only costs
  readable traces, not a release.

This keeps the image build reproducible and credential-free, and means the upload
token lives only in the publish step, never in image history. Outside a release
build the whole pipeline is inert: local and test builds emit no maps and run no
plugin.

## Configuration

All collector endpoints and credentials are server-side environment variables and
are never logged:

- Frontend RUM: `FARO_COLLECTOR_URL`, `FARO_APP_KEY`.
- Backend logs: `LOKI_HOST`, `LOKI_USER`, `LOKI_TOKEN`.

Absent these, the site runs normally; telemetry simply isn't shipped.

Source map upload is configured in CI, not at runtime. The upload endpoint, app id,
and stack id are non-secret identifiers committed in the deploy workflow; only the
upload token is a secret (`FARO_SOURCEMAP_API_KEY`, an access policy token scoped
`sourcemaps:read`/`write`/`delete`). The release build is told its version through
the `FARO_BUNDLE_VERSION` build argument, which becomes the bundle id suffix.

## Files

- `packages/shared/src/rum.ts` — lazy, sessionless Faro init (client).
- `packages/api/src/rum.ts` — first-party collector proxy (strips identifiers).
- `packages/api/src/logger.ts` — pino logger + request logging middleware.
- Client entries (`packages/*/src/main.*`) — schedule RUM init off the critical
  path.
- `scripts/faro-sourcemaps.ts` — build-time bundle-id injection + hidden source
  maps, gated to release builds; wired into each `packages/*/vite.config.ts`.
- `Dockerfile` (`sourcemaps` stage) and `.github/workflows/deploy.yml`
  (`sourcemaps` job) — export the maps and upload them per framework.
