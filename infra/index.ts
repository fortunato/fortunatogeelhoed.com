import { readFileSync } from 'node:fs';
import * as hcloud from '@pulumi/hcloud';
import * as pulumi from '@pulumi/pulumi';

// Provisions the single production host: one small Hetzner Cloud server running the app container
// behind Caddy. Run by hand (`pulumi up`) only when the infrastructure changes — routine releases
// never run this; they only swap the container on the already-provisioned server.

const cfg = new pulumi.Config();

// Non-secret configuration.
const domain = cfg.require('domain');
const location = cfg.get('location') ?? 'nbg1';
const serverType = cfg.get('serverType') ?? 'cx23';
const imageRepo = cfg.require('imageRepo'); // e.g. ghcr.io/fortunato/fortunatogeelhoed.com
const ghcrUser = cfg.get('ghcrUser') ?? ''; // only used when the image package is private
const adminSshKey = cfg.require('adminSshPublicKey');
const deploySshKey = cfg.require('deploySshPublicKey');
const fromEmail = cfg.require('ahasendFromEmail');
const fromName = cfg.get('ahasendFromName') ?? 'fortunatogeelhoed.com';

// Optional override for the log level applied to both stdout and Loki. Left unset the app uses its
// built-in default (info in production), the conventional production baseline.
const logLevel = cfg.get('logLevel') ?? '';

// Log shipping to hosted Loki (Grafana Cloud). Optional: leave these unset and the app logs to
// stdout only. The push endpoint and instance id are not secret; only the token is.
const lokiHost = cfg.get('lokiHost') ?? ''; // e.g. https://logs-prod-012.grafana.net
const lokiUser = cfg.get('lokiUser') ?? ''; // Grafana Cloud Loki instance/user id (numeric)

// Frontend RUM (Grafana Faro) collector for the first-party /api/rum proxy. Optional, like Loki.
// The receiver URL embeds the write key in its path (.../collect/<key>), so it is the whole
// credential; kept off the client by living here and being forwarded server-side.
const faroCollectorUrl = cfg.get('faroCollectorUrl') ?? ''; // Grafana Cloud Faro receiver URL

// Self-hosted, cookieless analytics (Umami) running as two extra containers on this host behind
// Caddy. The dashboard lives on its own subdomain; the app injects the tracking tag only when the
// website id is set (minted in the Umami dashboard after first boot). The container images are
// pinned by tag AND digest: the tag stays human-readable while the @sha256 makes the pull immutable,
// so a re-pushed tag can never silently change what we deploy. When bumping a tag, fetch the new
// digest too (see infra/README.md → "Updating Umami / Postgres").
const statsSubdomain = cfg.get('statsSubdomain') ?? `stats.${domain}`;
// The stats subdomain publishes only the cookieless collection paths (/script.js, /api/send);
// everything else, including the dashboard, sits behind Caddy basic auth so Umami's well-known
// default login is never reachable from the internet. The username is not secret; default to a
// neutral value. (These credentials are Caddy's own gate, independent of the Umami app login.)
const statsBasicAuthUser = cfg.get('statsBasicAuthUser') ?? 'fg-admin';
const umamiImage =
	cfg.get('umamiImage') ??
	'ghcr.io/umami-software/umami:postgresql-v2.19.0@sha256:77264ce6951c6b131a91d99f1cfd720d9efac1eaaa12e104f21cf49408dd77e0';
const postgresImage =
	cfg.get('postgresImage') ??
	'postgres:16.4-alpine@sha256:5660c2cbfea50c7a9127d17dc4e48543eedd3d7a41a595a2dfa572471e37e64c';
// The volume's data lives on a dedicated Hetzner Volume (provisioned below). Default size is the
// provider minimum; analytics for a portfolio site stays comfortably inside it.
const umamiVolumeSize = cfg.getNumber('umamiVolumeSize') ?? 10;
// The website id is created in the Umami UI on first boot, so it is unknown at first provision.
// Leave it unset initially; set it and re-run once the dashboard exists, and the tag goes live.
const umamiWebsiteId = cfg.get('umamiWebsiteId') ?? '';
// The host the tracking tag is allowed to record on; pins analytics to production only.
const umamiTrackingDomain = cfg.get('umamiTrackingDomain') ?? domain;

// Off-site Postgres backup to S3-compatible object storage via restic. All optional and off by
// default, like the Loki/Faro pipelines: leave the repository unset and the daily job no-ops.
// Provider is not hardcoded — the repository URL selects Backblaze B2, Cloudflare R2, etc.
const backupResticRepository = cfg.get('backupResticRepository') ?? '';

// Secrets — set with: pulumi config set --secret <key> <value>
// ghcrToken is the toggle for a private image: set it (with ghcrUser) and the server logs in to
// GHCR; leave it unset and a public image is pulled anonymously.
const ghcrToken = cfg.getSecret('ghcrToken');
const tailscaleAuthKey = cfg.requireSecret('tailscaleAuthKey');
const ahasendApiKey = cfg.requireSecret('ahasendApiKey');
const ahasendAccountId = cfg.requireSecret('ahasendAccountId');
const ahasendToEmail = cfg.requireSecret('ahasendToEmail');
const lokiToken = cfg.getSecret('lokiToken'); // Grafana Cloud access-policy token (logs:write)

// Umami secrets. APP_SECRET signs Umami sessions and must stay stable; the DB password is shared
// between the Postgres container and the Umami connection string. Both templated into cloud-init,
// never committed.
const umamiAppSecret = cfg.requireSecret('umamiAppSecret');
const umamiDbPassword = cfg.requireSecret('umamiDbPassword');
// bcrypt hash of the dashboard basic-auth password, the credential Caddy checks before proxying any
// non-collection path on the stats subdomain. A hash (not the plaintext) is stored: Caddy's
// basic_auth compares against it, and even the rendered cloud-init never carries the password. Mint
// it with `caddy hash-password` (or any bcrypt tool) and set it as a secret; see infra/README.md.
const statsBasicAuthHash = cfg.requireSecret('statsBasicAuthHash');

// Off-site backup secrets. All optional: unset leaves the daily job disabled. The restic passphrase
// protects (and is required to restore) the off-site copy. The daily job runs `restic forget
// --prune`, which deletes objects, so the S3 token needs read+write+delete on the bucket; it is not
// append-only. For immutability use R2 object-versioning / a bucket lifecycle policy instead.
const backupResticPassword = cfg.getSecret('backupResticPassword');
const backupS3AccessKeyId = cfg.getSecret('backupS3AccessKeyId');
const backupS3SecretAccessKey = cfg.getSecret('backupS3SecretAccessKey');

// Admin key gives root access over the private tailnet and suppresses the emailed root password.
const sshKey = new hcloud.SshKey('admin', { name: 'fg-admin', publicKey: adminSshKey });

// Public firewall: only the web ports face the internet. There is no public SSH — administrative
// and deploy access arrive over the Tailscale tailnet. Port 25 is never opened; mail leaves via
// the provider over 443.
const firewall = new hcloud.Firewall('web', {
	name: 'fg-web',
	rules: [
		{ direction: 'in', protocol: 'tcp', port: '80', sourceIps: ['0.0.0.0/0', '::/0'] },
		{ direction: 'in', protocol: 'tcp', port: '443', sourceIps: ['0.0.0.0/0', '::/0'] },
	],
});

// Dedicated persistent volume for the Postgres data directory only. The Umami app is stateless and
// mounts nothing; this volume has one writer (this Postgres) and one purpose (analytics), so it is
// never co-mingled with other data. It survives host rebuilds and is snapshot-able for backups. Its
// id is templated into cloud-init, which finds it at the stable /dev/disk/by-id path and mounts it
// for the Postgres data dir.
const umamiVolume = new hcloud.Volume('umami-db', {
	name: 'fg-umami-db',
	size: umamiVolumeSize,
	location,
	format: 'ext4',
	labels: { app: 'fortunatogeelhoed', role: 'umami-postgres' },
});

// Render cloud-init with config and secrets templated in. The rendered document contains secrets
// and lives only transiently inside Pulumi state — keep that state private; never commit it.
const template = readFileSync(new URL('./cloud-init.yaml', import.meta.url), 'utf8');
const userData = pulumi
	.all([
		ghcrToken,
		tailscaleAuthKey,
		ahasendApiKey,
		ahasendAccountId,
		ahasendToEmail,
		lokiToken,
		umamiAppSecret,
		umamiDbPassword,
		statsBasicAuthHash,
		backupResticPassword,
		backupS3AccessKeyId,
		backupS3SecretAccessKey,
		umamiVolume.id,
	])
	.apply(
		([
			token,
			ts,
			apiKey,
			accountId,
			toEmail,
			lToken,
			appSecret,
			dbPassword,
			statsAuthHash,
			resticPassword,
			s3Key,
			s3Secret,
			volumeId,
		]) =>
			template
				.replaceAll('__GHCR_USER__', ghcrUser)
				.replaceAll('__GHCR_TOKEN__', token ?? '')
				.replaceAll('__IMAGE_REPO__', imageRepo)
				.replaceAll('__DOMAIN__', domain)
				.replaceAll('__DEPLOY_PUBKEY__', deploySshKey)
				.replaceAll('__TAILSCALE_AUTHKEY__', ts)
				.replaceAll('__AHASEND_API_KEY__', apiKey)
				.replaceAll('__AHASEND_ACCOUNT_ID__', accountId)
				.replaceAll('__AHASEND_FROM_EMAIL__', fromEmail)
				.replaceAll('__AHASEND_FROM_NAME__', fromName)
				.replaceAll('__AHASEND_TO_EMAIL__', toEmail)
				.replaceAll('__LOG_LEVEL__', logLevel)
				.replaceAll('__LOKI_HOST__', lokiHost)
				.replaceAll('__LOKI_USER__', lokiUser)
				.replaceAll('__LOKI_TOKEN__', lToken ?? '')
				.replaceAll('__FARO_COLLECTOR_URL__', faroCollectorUrl)
				.replaceAll('__STATS_DOMAIN__', statsSubdomain)
				.replaceAll('__STATS_BASIC_AUTH_USER__', statsBasicAuthUser)
				.replaceAll('__STATS_BASIC_AUTH_HASH__', statsAuthHash)
				.replaceAll('__UMAMI_IMAGE__', umamiImage)
				.replaceAll('__POSTGRES_IMAGE__', postgresImage)
				.replaceAll('__UMAMI_HOST__', umamiWebsiteId ? statsSubdomain : '')
				.replaceAll('__UMAMI_WEBSITE_ID__', umamiWebsiteId)
				.replaceAll('__UMAMI_DOMAIN__', umamiTrackingDomain)
				.replaceAll('__UMAMI_APP_SECRET__', appSecret)
				.replaceAll('__UMAMI_DB_PASSWORD__', dbPassword)
				.replaceAll('__UMAMI_VOLUME_ID__', volumeId)
				.replaceAll('__BACKUP_RESTIC_REPOSITORY__', backupResticRepository)
				.replaceAll('__BACKUP_RESTIC_PASSWORD__', resticPassword ?? '')
				.replaceAll('__BACKUP_S3_ACCESS_KEY_ID__', s3Key ?? '')
				.replaceAll('__BACKUP_S3_SECRET_ACCESS_KEY__', s3Secret ?? ''),
	);

const server = new hcloud.Server('app', {
	name: 'fg-app',
	serverType, // cx23 — Cost-Optimized 2 vCPU / 4 GB; ample for a static-serving Bun process
	image: 'ubuntu-24.04',
	location,
	sshKeys: [sshKey.name],
	firewallIds: [firewall.id.apply((id) => Number.parseInt(id, 10))],
	userData,
	labels: { app: 'fortunatogeelhoed' },
});

// Attach the Postgres volume to the host. cloud-init formats it on first use only and mounts it for
// the Postgres data dir; `automount: false` leaves mounting to cloud-init so the path is controlled
// here rather than by the provider's default mount location.
new hcloud.VolumeAttachment('umami-db', {
	volumeId: umamiVolume.id.apply((id) => Number.parseInt(id, 10)),
	serverId: server.id.apply((id) => Number.parseInt(id, 10)),
	automount: false,
});

export const ipv4 = server.ipv4Address;
export const ipv6 = server.ipv6Address;
// The analytics dashboard host. Point a DNS A/AAAA record for this name at the ipv4/ipv6 outputs so
// Caddy can obtain its certificate.
export const statsHost = statsSubdomain;
