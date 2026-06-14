# Infrastructure

The production host for fortunatogeelhoed.com, defined with [Pulumi](https://www.pulumi.com/) in
TypeScript. It provisions a single small Hetzner Cloud server that runs the application container
behind [Caddy](https://caddyserver.com/) (automatic HTTPS). Email is sent through AhaSend over
HTTPS, so the server runs no mail software and never needs port 25.

This is a self-contained project, separate from the application workspace: it has its own
dependencies and its own `pulumi up` / `pulumi preview` lifecycle.

## Two lifecycles

- **Provisioning** (this project) is run **by hand**, only when the infrastructure changes. The
  first-boot bootstrap (`cloud-init.yaml`) is deliberately minimal and contains no app version, so
  routine deploys never require re-provisioning. Changing `cloud-init.yaml` replaces the server.
- **Deployment** is automated by `.github/workflows/deploy.yml`: publishing a versioned GitHub
  Release builds a version-tagged image and rolls that exact tag onto the running server. It never
  runs Pulumi.

## Bootstrap order (first time only)

There is a deliberate ordering to the very first setup, because two things would otherwise deadlock:
the server's first-boot script **pulls the app image from GHCR**, but the automated deploy **needs
the server to already exist**. Break the cycle by seeding an image *before* provisioning:

1. Do the **One-time setup** and **Configure the stack** below (accounts, keys, Pulumi config).
2. **Seed the first image to GHCR.** In GitHub, run the **Deploy** workflow manually
   (Actions → *Deploy* → *Run workflow*). With no release attached it only **builds and pushes
   `:latest`** — the deploy job is skipped because there is no server yet.
3. **`pulumi up`.** The server boots and cloud-init pulls that `:latest` image, so the app starts
   immediately. (If you skip step 2, provisioning still succeeds cleanly, but the app stays down
   until the first release deploys it.)
4. **Point DNS** at the output IP (below) so Caddy can obtain a certificate.
5. **Add the deploy secrets** (below) so future releases can reach the server.
6. **From now on**, publish a release `vX.Y.Z`: the workflow builds the new version and deploys it
   onto the running server, waiting for the container's healthcheck and **rolling back automatically
   if it never becomes healthy**. Roll back manually by re-running a deploy for a previous tag.

## One-time setup

1. **Accounts** (free tiers are sufficient): Hetzner Cloud, Pulumi, Tailscale; an AhaSend account
   with a **verified sender domain** (SPF/DKIM records on the domain).
2. **State backend**: log in to Pulumi (`pulumi login`) so state and encrypted config live in a
   durable backend rather than on one machine.
3. **Hetzner token**: `export HCLOUD_TOKEN=...` (or `pulumi config set --secret hcloud:token ...`).
4. **Keys**:
   - an **admin** SSH keypair (for break-glass root access over the tailnet);
   - a **deploy** SSH keypair (its public half is restricted to the deploy script on the server;
     its private half becomes a GitHub Actions secret).
5. **Tailscale**: apply [`tailscale-policy.hujson`](./tailscale-policy.hujson) in the admin console
   (Access controls) — it declares the `tag:fg-server` / `tag:fg-deploy` tags and the SSH access
   rules. Create an **OAuth client** that issues ephemeral `tag:fg-deploy` nodes (for CI). The
   server joins the tailnet at boot with a reusable auth key and applies `tag:fg-server` itself via
   `--advertise-tags` in `cloud-init.yaml` (so the tag is explicit in the infrastructure rather than
   implicit in how the key was created). The auth key need only be a reusable key whose owner is
   permitted to apply that tag (an admin owns it via `tagOwners`). The tag is what the deploy ACL
   keys on, and it disables node-key expiry so the server does not drop off the network.

## Configure the stack

```sh
cd infra
bun install
pulumi stack init prod

# non-secret
pulumi config set domain fortunatogeelhoed.com
pulumi config set imageRepo ghcr.io/<owner>/<repo>
pulumi config set ahasendFromEmail no-reply@fortunatogeelhoed.com
pulumi config set adminSshPublicKey "ssh-ed25519 AAAA... admin"
pulumi config set deploySshPublicKey "ssh-ed25519 AAAA... deploy"
# location / serverType / ahasendFromName are optional (defaults: nbg1 / cx23 / the domain)

# observability (optional — see "Observability" below; omit any and that pipeline stays off)
pulumi config set logLevel info                                # omit for the built-in prod default (info)
pulumi config set lokiHost https://logs-prod-012.grafana.net   # Loki push endpoint
pulumi config set lokiUser <grafana cloud loki instance id>    # numeric user id
pulumi config set faroCollectorUrl <faro receiver url, e.g. https://faro-collector-prod-eu-west-2.grafana.net/collect/KEY>

# analytics (self-hosted Umami — see "Analytics" below)
# statsSubdomain / umamiTrackingDomain default to stats.<domain> / <domain>
# umamiImage / postgresImage / umamiVolumeSize have sane pinned defaults
pulumi config set umamiWebsiteId <id from the Umami dashboard, set after first boot>
pulumi config set --secret umamiAppSecret <random 32+ char string>
pulumi config set --secret umamiDbPassword <random db password>
# Dashboard gate: Caddy basic auth fronts everything on stats.<domain> except the public collection
# paths, so the Umami admin UI is never reachable on its default login. Username is non-secret
# (default fg-admin); the secret is a bcrypt HASH of the password, minted with `caddy hash-password`:
#   docker run --rm caddy:2 caddy hash-password --plaintext '<choose a strong password>'
# pulumi config set statsBasicAuthUser fg-admin                  # optional, this is the default
pulumi config set --secret statsBasicAuthHash '<bcrypt hash from caddy hash-password>'
# off-site backup (optional — omit to leave daily backups disabled). Provider: Cloudflare R2.
# Use an EU-jurisdiction bucket and a bucket-scoped R2 API token. The job prunes old snapshots, so
# the token needs read+write+delete (not append-only); enable R2 versioning/lifecycle for immutability.
pulumi config set backupResticRepository s3:https://<account-id>.r2.cloudflarestorage.com/<bucket>/umami
pulumi config set --secret backupResticPassword <restic repo passphrase>
pulumi config set --secret backupS3AccessKeyId <R2 bucket-scoped token id>
pulumi config set --secret backupS3SecretAccessKey <R2 bucket-scoped token secret>

# secrets
pulumi config set --secret tailscaleAuthKey <tailscale auth key>
pulumi config set --secret ahasendApiKey <AhaSend api key>
pulumi config set --secret ahasendAccountId <AhaSend account id>
pulumi config set --secret ahasendToEmail <destination inbox>
pulumi config set --secret lokiToken <grafana cloud access-policy token, logs:write>

# Private image only — leave both unset for a public GHCR package (recommended):
# pulumi config set ghcrUser <github-user>
# pulumi config set --secret ghcrToken <read:packages PAT>
```

> The stack config file can hold encrypted secrets. It is `.gitignore`d here by default; only
> commit it if your backend (Pulumi Cloud, or an external passphrase) makes the ciphertext safe to
> publish. The rendered `cloud-init` (which contains plaintext secrets) exists only transiently in
> Pulumi state — keep state private.

## Provision

Seed an image first (see **Bootstrap order**, step 2) so the first boot has something to pull.

```sh
pulumi preview          # expect only SshKey / Firewall / Server, and no secret in the diff
pulumi up
pulumi stack output ipv4
pulumi stack output ipv6
```

Validate on a throwaway stack first (`pulumi up` then `pulumi destroy`) with a temporary token.

## After provisioning

1. **DNS** (at your registrar): point the apex `A` record at the `ipv4` output and `AAAA` at
   `ipv6`. Caddy can only obtain a certificate once DNS resolves to the server. Add the **same
   `A`/`AAAA` pair for the stats subdomain** (`stats.<domain>`, the `statsHost` output) so the
   analytics dashboard gets its own certificate.
2. **GitHub Actions secrets** (repo → Settings → Secrets): `DEPLOY_SSH_KEY` (the deploy private
   key), `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET` (the OAuth client that joins CI as `tag:fg-deploy`).
   Image push uses the built-in `GITHUB_TOKEN`. Optional: `FARO_SOURCEMAP_API_KEY` (frontend sourcemap
   upload, see `docs/frontend-telemetry.md`); `TS_API_CLIENT_ID` / `TS_API_SECRET` (a second Tailscale
   OAuth client, scoped `devices:core` write on `tag:fg-server`, used to prune stale device
   registrations after a server replacement).
3. **Deploy**: publish a release `vX.Y.Z`; the workflow builds, pushes, and rolls it out. Roll
   back by re-running the deploy for a previous tag.

   The roll targets the server by its **current tailnet address** (the one online `tag:fg-server`
   node), not the `fg-app` MagicDNS name: replacing the server leaves the old registration behind, so
   Tailscale suffixes the reused name (`fg-app-1`) and the bare name points at the dead node. A
   best-effort prune step then deletes the stale `tag:fg-server` registrations (never the live one,
   which is matched and excluded by address), so they stop accumulating. If `TS_API_*` is unset the
   prune is skipped; addressing by tag still works.

## Observability

Two independent pipelines ship telemetry to Grafana Cloud (free tier). Both are optional: leave a
pipeline's config unset and the app simply doesn't ship that signal — stdout logging and the site
itself are never affected.

- **Backend logs** — pino ships structured logs to Loki via `LOKI_HOST` / `LOKI_USER` /
  `LOKI_TOKEN`. The host is the Loki **push** endpoint and the user is the numeric instance id, both
  shown on the Loki data-source details page in Grafana Cloud; the token is an **Access Policy**
  token scoped `logs:write` (Grafana Cloud → Access Policies). All three must be present or pino
  falls back to stdout only. `LOG_LEVEL` gates both stdout and Loki and defaults to `info` (the
  conventional production baseline); set it (e.g. `warn`) only to deviate.
- **Frontend RUM** — the browser posts errors and Web Vitals to the first-party `/api/rum` proxy,
  which forwards to the Grafana Cloud **Faro** receiver using `FARO_COLLECTOR_URL` (the receiver URL
  from Frontend Observability → Settings → Web SDK). That URL embeds the write key in its path
  (`.../collect/<key>`), so it is the whole credential; kept server-side, it never reaches the
  browser. Without the collector URL the proxy drops payloads and answers 204.

These map 1:1 to the `loki*` / `faro*` Pulumi config above; set them with the rest of the stack
config and `pulumi up` carries them into the server's `app.env`. Confirm logs are flowing in Grafana
with `{app="fortunatogeelhoed"}` (the labels pino attaches).

### Why managed, not self-hosted

Telemetry goes to Grafana Cloud rather than a self-hosted Loki/Grafana stack on this box, and that
stays true even though we already run a self-hosted Postgres for Umami — the two are not comparable:

- **Failure-domain isolation.** Observability exists to explain why the host is unhealthy, often while
  it is unhealthy. Self-hosting it on the single host it observes means the logs die with the box, at
  the exact moment you need them. Off-box telemetry gives out-of-band sight.
- **The Umami Postgres doesn't lower the cost.** Loki/Faro don't use Postgres; a self-hosted stack is
  a separate, heavier set of always-ingesting services (Loki + Grafana + a receiver, likely
  Prometheus/Tempo) that would contend with the actual site for memory on a ~4 GB host.
- **Toil vs. value.** Umami is "daily backup, occasional bump." An observability platform is ongoing
  retention/disk/upgrade care for no user-facing gain here.
- **The free tier covers a portfolio's volume**, with an EU region available, so the usual
  self-hosting motives (cost, residency) barely apply; the data is low-sensitivity anyway.

The code stays self-hostable in principle. Revisit only for a deliberate "run my own observability"
showcase (on a *separate* host, to preserve the isolation above) or at real multi-host scale.

## Analytics (self-hosted Umami)

Visitor analytics are self-hosted and **cookieless**, so there is no consent banner and no
per-device identifier — name it on the `/privacy` page. It runs as two extra containers on this same
host alongside the app, fronted by Caddy on `stats.<domain>`:

- **`umami`** — the dashboard and collector. Stateless: it holds no data on disk, runs its own DB
  migrations on startup, and keeps all state in Postgres.
- **`umami-db`** — PostgreSQL, the only stateful piece. Its data directory lives on a **dedicated
  Hetzner Volume** (`fg-umami-db`) mounted at `/mnt/umami-db`, so it survives host rebuilds and is
  snapshot-able. That volume has one writer and one purpose; nothing else is stored on it.

Neither container is published — only Caddy faces the internet. `APP_SECRET` and the Postgres
password come from Pulumi config secrets (`umamiAppSecret`, `umamiDbPassword`) and are templated into
the host's env files at provision time; they are never committed.

### Dashboard access (it is not open to the internet)

Umami ships with a well-known default login (`admin` / `umami`), and this origin is trusted by the
main site's CSP for `script-src`, so an openly reachable dashboard would be a takeover and XSS-pivot
risk. Caddy therefore publishes **only the two paths analytics collection needs** on `stats.<domain>`
and gates everything else behind HTTP **basic auth**:

- **Public, unauthenticated** — `GET /script.js` (the cookieless tracker the site loads) and
  `POST /api/send` (the event beacon). These are all that page-view collection requires.
- **Everything else** (the dashboard, `/login`, the admin `/api/*`) requires the Caddy basic-auth
  credentials. These are an independent gate in front of Umami; they are **not** the Umami app login,
  so the default `admin` / `umami` is unreachable from the internet regardless of whether it was
  changed inside the app.

So **to reach the dashboard**, browse to `https://stats.<domain>` and authenticate with the basic-auth
credentials (`statsBasicAuthUser` and the password whose bcrypt hash you set as `statsBasicAuthHash`);
the browser then shows Umami's own login. Still change Umami's default app password on first login as
defence in depth. If you would rather restrict the dashboard to the tailnet instead of basic auth,
replace the gated `handle` block's `basic_auth` with a `remote_ip` matcher for your Tailscale CGNAT
range (`100.64.0.0/10`) — the host already runs Tailscale.

### First-boot wiring (the website id)

The tracking tag is injected into the served HTML **only once a website id exists**, which is minted
in the dashboard after the first boot. So the order is:

1. `pulumi up` with `umamiAppSecret` / `umamiDbPassword` / `statsBasicAuthHash` set (and DNS for
   `stats.<domain>` pointed at the host). Browse to `https://stats.<domain>`, pass the Caddy
   basic-auth prompt, then log in to Umami and change its default app password immediately.
2. In the dashboard, add the website `fortunatogeelhoed.com` and copy its **Website ID**.
3. `pulumi config set umamiWebsiteId <id>` and `pulumi up` again. The app now injects the cookieless
   `script.js` tag with `data-domains="fortunatogeelhoed.com"`, so it records on production only —
   never on localhost or previews. (The CSP automatically allows the stats origin for the script and
   its beacon once the host is configured.)

### Pinned versions and updates

Both images are pinned by **tag _and_ digest** (`name:tag@sha256:…`) — never `latest` — so deploys
are reproducible and a re-pushed tag can never silently change what runs. These containers are
separate from the site app, so updating them is a container swap on the host, independent of routine
app releases.

When you bump a tag you **must also refresh its digest**. Fetch the new one with:

```sh
docker buildx imagetools inspect ghcr.io/umami-software/umami:postgresql-v2.19.0   # shows the digest
# or, no Docker needed:
skopeo inspect docker://postgres:16.4-alpine --format '{{.Digest}}'
```

Then set both, e.g. `pulumi config set umamiImage 'ghcr.io/umami-software/umami:<tag>@sha256:<digest>'`.
Leaving the config unset uses the digest-pinned defaults baked into `index.ts`.

- **Umami**: bump `umamiImage` (tag + digest) and re-provision (or re-pull/restart the container).
  Umami applies its own DB migrations on startup. Read the release notes; on a **major** bump
  (v2 → v3) snapshot the volume and take a `pg_dump` first.
- **Postgres — patch/minor** (e.g. `16.4 → 16.5`): safe in-place. Bump `postgresImage` (tag + digest)
  to a newer patch of the **same major** and restart. Apply promptly for security fixes.
- **Postgres — major** (e.g. `16 → 17`): **not** a simple tag swap — the on-disk format changes.
  Snapshot the volume, `pg_dump` the database, stand up the new major, and restore. Do not bump the
  major casually.

Optionally let Renovate/Dependabot watch the two image tags and open update PRs.

### Backups (3-2-1)

Postgres is the only stateful component, so backups protect that one database. Three copies, two
media, one off-site:

1. **Live volume** — the running Postgres data dir on the Hetzner Volume.
2. **Hetzner Volume snapshot** — fast provider-level recovery from corruption or a bad version bump.
   Enable scheduled snapshots in the Hetzner console (same provider/account, so not sufficient
   alone).
3. **Off-site encrypted dump (required)** — a daily `systemd` timer (`umami-backup.timer`) runs
   `pg_dump` → gzip → **restic** (encryption + dedup + retention) → **off-Hetzner** S3-compatible
   object storage. Chosen provider: **Cloudflare R2** — S3-compatible, egress-free (so restores and
   restic `check` reads cost nothing), and its free tier is ample for this small, deduplicated
   workload. Create the bucket with **EU jurisdiction** to keep the off-site copy EU-resident.
   Backblaze B2 or a Hetzner Storage Box are drop-in alternatives. This is the copy that survives
   host loss or a destructive deletion.

The off-site job is **opt-in**, like the Loki/Faro pipelines: leave `backupResticRepository` unset
and the timer runs but no-ops cleanly. When configured:

- **Provider is not hardcoded** — the `backupResticRepository` URL selects it. For R2 the repository
  is `s3:https://<account-id>.r2.cloudflarestorage.com/<bucket>/umami`.
- **Credentials** (`backupS3AccessKeyId` / `backupS3SecretAccessKey`) should be a **bucket-scoped**
  token (on R2, scope the API token to the single backup bucket). Note this is **not** append-only:
  the daily job runs `restic forget --prune`, which deletes objects, so the token needs
  read+write+**delete** on the bucket and a compromised host could purge backup history. To get
  immutability back, enable **R2 object-versioning and/or a bucket lifecycle policy** so deleted
  objects are recoverable out-of-band; relying on token scope alone does not protect history here.
- **Retention** is 7 daily + 4 weekly, pruned after each successful backup.
- **Observability**: every run logs to journald (shipped to Loki) and ends with a structured line
  `{"job":"umami-backup",...,"result":"ok|degraded|failed|disabled"}`. `degraded` means the backup
  was written but `forget --prune` (retention) failed, so it is not counted as a healthy `ok` run.
  Alert on a **missing** `ok` (no green run in N hours) and on `degraded`/`failed`, not only on
  explicit failures.
- **Restore drill**: exercise the restore at least once (and after any major change) so the off-site
  copy is known-good, not assumed.

Logical dumps (not continuous WAL archiving) are deliberate: for analytics a worst-case RPO of ~1 day
is acceptable, and dumps stay portable across Postgres majors.

#### Restore procedure

The snapshot holds a single gzipped plain-SQL dump (`umami.sql.gz`, tag `umami`). Restore reads from
the **same** restic repo, so you need the four backup values from Pulumi config in the environment:

```sh
export RESTIC_REPOSITORY='s3:https://<account-id>.r2.cloudflarestorage.com/<bucket>/umami'
export RESTIC_PASSWORD='<restic passphrase>'
export AWS_ACCESS_KEY_ID='<R2 token id>'        # restic's S3 backend reads the AWS_* names
export AWS_SECRET_ACCESS_KEY='<R2 token secret>'

restic snapshots --tag umami            # 1. list available backups, pick one (or use `latest`)
```

**Verify / drill** — stream the dump into a throwaway Postgres and check it, touching nothing live:

```sh
docker run -d --name pg-restore-check -e POSTGRES_USER=umami -e POSTGRES_PASSWORD=x -e POSTGRES_DB=umami postgres:16-alpine
restic dump latest umami.sql.gz | gunzip | docker exec -i pg-restore-check psql -U umami -d umami
docker exec pg-restore-check psql -U umami -d umami -c '\dt'   # tables present?
docker rm -f pg-restore-check
```

**Real recovery** — into the live database (the dump is plain SQL with no `DROP`/`CREATE`, so restore
into an **empty** `umami` db):

```sh
docker stop umami                                   # stop writes
docker exec umami-db psql -U umami -d postgres -c 'DROP DATABASE umami; CREATE DATABASE umami;'
restic dump latest umami.sql.gz | gunzip | docker exec -i umami-db psql -U umami -d umami
docker start umami
```

`restic dump <id> umami.sql.gz` streams a specific snapshot instead of `latest`. If restic's cache is
cold on a fresh host, run `restic snapshots` first to rebuild it.

## Uptime monitoring

The container restart policy recovers crashes and reboots, but it cannot report that the site is
down. A wedged process, a crash loop, an expired certificate, a dead host, or broken DNS all look
healthy to it. Uptime is therefore checked from outside the host: a request to the site over HTTPS
runs every minute and alerts on failure. An external check covers all of those failure modes
whatever state the host is in.

The check runs in Grafana Synthetic Monitoring, because backend logs and frontend telemetry already
go to Grafana Cloud and its free tier covers one check and alert. UptimeRobot and Healthchecks.io
are equivalent alternatives.

## Notes

- **GHCR package visibility**: the image holds only the built public site (no secrets — those are
  runtime env), so making the package **public** is recommended. Public pulls need no credentials,
  so you can drop `ghcrToken` and the `docker login` line; public packages are also free with no
  storage limit. If you keep it private, the server pulls using the `read:packages` token in
  `ghcrToken`. After the first push, set visibility under the repo's Packages settings.
- `cx23` is the Cost-Optimized tier (2 vCPU / 4 GB) — generous for a static-serving Bun process. It
  carries a "Limited availability" badge; if `pulumi up` cannot obtain one, set
  `pulumi config set serverType cx32` (Regular Performance) and retry.
- Dependency versions in `package.json` are starting points; pin them to what `bun install`
  resolves.
