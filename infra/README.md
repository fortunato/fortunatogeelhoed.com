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
pulumi config set faroCollectorUrl <grafana cloud faro receiver url>

# secrets
pulumi config set --secret tailscaleAuthKey <tailscale auth key>
pulumi config set --secret ahasendApiKey <AhaSend api key>
pulumi config set --secret ahasendAccountId <AhaSend account id>
pulumi config set --secret ahasendToEmail <destination inbox>
pulumi config set --secret lokiToken <grafana cloud access-policy token, logs:write>
pulumi config set --secret faroAppKey <grafana cloud faro app key>

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
   `ipv6`. Caddy can only obtain a certificate once DNS resolves to the server.
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
  from Frontend Observability → Settings → Web SDK) and `FARO_APP_KEY` (sent as `x-api-key`). The
  key is kept server-side and never reaches the browser. Without the collector URL the proxy drops
  payloads and answers 204.

These map 1:1 to the `loki*` / `faro*` Pulumi config above; set them with the rest of the stack
config and `pulumi up` carries them into the server's `app.env`. Confirm logs are flowing in Grafana
with `{app="fortunatogeelhoed"}` (the labels pino attaches).

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
