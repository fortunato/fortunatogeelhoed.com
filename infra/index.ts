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
const faroCollectorUrl = cfg.get('faroCollectorUrl') ?? ''; // Grafana Cloud Faro receiver URL

// Secrets — set with: pulumi config set --secret <key> <value>
// ghcrToken is the toggle for a private image: set it (with ghcrUser) and the server logs in to
// GHCR; leave it unset and a public image is pulled anonymously.
const ghcrToken = cfg.getSecret('ghcrToken');
const tailscaleAuthKey = cfg.requireSecret('tailscaleAuthKey');
const ahasendApiKey = cfg.requireSecret('ahasendApiKey');
const ahasendAccountId = cfg.requireSecret('ahasendAccountId');
const ahasendToEmail = cfg.requireSecret('ahasendToEmail');
const lokiToken = cfg.getSecret('lokiToken'); // Grafana Cloud access-policy token (logs:write)
const faroAppKey = cfg.getSecret('faroAppKey'); // Faro collector key (sent as x-api-key, kept server-side)

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
		faroAppKey,
	])
	.apply(([token, ts, apiKey, accountId, toEmail, lToken, fKey]) =>
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
			.replaceAll('__FARO_APP_KEY__', fKey ?? ''),
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

export const ipv4 = server.ipv4Address;
export const ipv6 = server.ipv6Address;
