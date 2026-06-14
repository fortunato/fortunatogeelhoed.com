import { type Availability, availabilityBadge, availabilityBookedLine } from '@fg/shared';

// Minimal HTML-text escaping for values interpolated into prerendered markup.
function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Rewrite the prerendered contact page to reflect the live availability, and inject the same
// value as a JSON seed the client reads on first render.
//
// The prerender bakes the optimistic "available" state into the HTML; at request time we patch
// it so first paint and no-JS visitors see the real value, and the client's framework (which
// reads the seed) renders the identical value, so hydration neither mismatches nor flips.
//
// Elements are matched by stable marker attributes (data-availability-badge / -line) and the
// inner content is replaced non-greedily, which tolerates the extra attributes and nodes the
// different frameworks add. The badge's data-state is rewritten in place to drive the muted
// "booked" styling.
export function applyAvailability(html: string, a: Availability): string {
	const state = a.available ? 'available' : 'booked';
	const badge = escapeHtml(availabilityBadge(a));

	let out = html.replace(
		/<span([^>]*data-availability-badge[^>]*)>[\s\S]*?<\/span>/,
		(_match, attrs: string) => {
			// Quote-agnostic: frameworks may emit double-, single-, or unquoted attribute values, and
			// a value left unrewritten would ship stale optimistic state.
			const nextAttrs = attrs.replace(
				/data-state=("[^"]*"|'[^']*'|[^\s>]+)/,
				`data-state="${state}"`,
			);
			return `<span${nextAttrs}>${badge}</span>`;
		},
	);

	// The sub-line only changes when booked; when available it keeps the baked page copy.
	if (!a.available) {
		const line = escapeHtml(availabilityBookedLine(a));
		out = out.replace(
			/<p([^>]*data-availability-line[^>]*)>[\s\S]*?<\/p>/,
			(_match, attrs: string) => `<p${attrs}>${line}</p>`,
		);
	}

	// Seed the client. type="application/json" so it is read, not executed; "<" is escaped so
	// the value can never break out of the script element.
	const seed = JSON.stringify(a).replace(/</g, '\\u003c');
	return out.replace(
		'</head>',
		`<script type="application/json" id="jb-availability">${seed}</script></head>`,
	);
}

// Self-hosted analytics (Umami) configuration, read from the environment once. The website id is
// minted in the Umami dashboard after first boot and supplied as config; the script host is the
// stats subdomain Caddy fronts. Both empty in development and previews, which keeps the tag off
// localhost entirely.
export interface AnalyticsConfig {
	scriptUrl: string;
	websiteId: string;
	// The single host the script is allowed to record on, so previews and localhost never report
	// into production analytics even if they somehow served the tag.
	domain: string;
}

// Build the analytics config from the environment, or null when it is not fully configured. Like
// the optional Loki/Faro pipelines, a missing value simply turns the feature off rather than
// breaking the page.
export function analyticsConfigFromEnv(): AnalyticsConfig | null {
	const host = process.env.UMAMI_HOST?.trim();
	const websiteId = process.env.UMAMI_WEBSITE_ID?.trim();
	if (!host || !websiteId) return null;
	const domain = process.env.UMAMI_DOMAIN?.trim() || 'fortunatogeelhoed.com';
	return { scriptUrl: `https://${host}/script.js`, websiteId, domain };
}

// Escape a value for use inside a double-quoted HTML attribute. The host and id come from operator
// config, but escaping keeps the injected tag well-formed regardless of what is supplied.
function escapeAttr(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

// Inject the cookieless Umami tracking tag into the document head. `data-domains` pins recording to
// the production host, and the script is `defer` + `async` so it never blocks render. It is
// cookieless and stores no per-device identifier, so it runs without a consent banner. Returns the
// HTML unchanged when analytics is not configured.
export function applyAnalytics(html: string, config: AnalyticsConfig | null): string {
	if (!config) return html;
	const tag =
		`<script defer src="${escapeAttr(config.scriptUrl)}"` +
		` data-website-id="${escapeAttr(config.websiteId)}"` +
		` data-domains="${escapeAttr(config.domain)}"></script>`;
	return html.replace('</head>', `${tag}</head>`);
}
