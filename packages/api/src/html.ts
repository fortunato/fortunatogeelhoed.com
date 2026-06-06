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
			const nextAttrs = attrs.replace(/data-state="[^"]*"/, `data-state="${state}"`);
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
