import { describe, expect, it } from 'vitest';
import { type AnalyticsConfig, applyAnalytics, applyAvailability } from './html';

// A trimmed prerendered contact page, shaped like the framework output (marker attributes,
// optimistic "available" baked in, a <head> to receive the seed).
const PAGE = [
	'<head><title>Contact</title></head>',
	'<body><div id="app"><section><div class="container">',
	'<span class="section-label" data-availability-badge="true" data-state="available">Available Now</span>',
	'<h1 class="section-title">Let&#x27;s work together.</h1>',
	'<p data-availability-line="true" style="color: var(--jb-text-secondary)">Get in touch.</p>',
	'</div></section></div></body>',
].join('');

describe('applyAvailability', () => {
	it('rewrites the badge, sub-line and state when booked', () => {
		const out = applyAvailability(PAGE, { available: false, until: 'August' });

		expect(out).toContain('data-state="booked"');
		expect(out).toContain('>Booked until August</span>');
		expect(out).toContain('Booked until August, but I plan new work a few weeks ahead.');
		expect(out).not.toContain('Available Now');
		expect(out).not.toContain('Get in touch.');
	});

	it('leaves the badge accent and page copy when available', () => {
		const out = applyAvailability(PAGE, { available: true, until: '' });

		expect(out).toContain('data-state="available"');
		expect(out).toContain('>Available Now</span>');
		// Available keeps the baked sub-line copy untouched.
		expect(out).toContain('Get in touch.');
	});

	it('injects the value as a JSON seed for the client', () => {
		const out = applyAvailability(PAGE, { available: false, until: 'August' });
		expect(out).toContain(
			'<script type="application/json" id="jb-availability">{"available":false,"until":"August"}</script>',
		);
	});

	it('escapes characters that could break out of the seed script', () => {
		const out = applyAvailability(PAGE, { available: false, until: '</script><b>' });
		expect(out).not.toContain('</script><b>');
		expect(out).toContain('\\u003c');
	});

	it('rewrites data-state whatever quote style the framework emits', () => {
		const singleQuoted = PAGE.replace('data-state="available"', "data-state='available'");
		const out = applyAvailability(singleQuoted, { available: false, until: '' });

		expect(out).toContain('data-state="booked"');
		expect(out).not.toContain("data-state='available'");
	});

	it('tolerates extra attributes and inner nodes around the badge', () => {
		const ng = PAGE.replace(
			'<span class="section-label" data-availability-badge="true" data-state="available">Available Now</span>',
			'<span _ngcontent-x class="section-label" data-availability-badge data-state="available"><!--c-->Available Now<!--/c--></span>',
		);
		const out = applyAvailability(ng, { available: false, until: '' });

		expect(out).toContain('data-state="booked"');
		expect(out).toContain('>Currently booked</span>');
	});
});

const ANALYTICS: AnalyticsConfig = {
	scriptUrl: 'https://stats.fortunatogeelhoed.com/script.js',
	websiteId: 'abc-123',
	domain: 'fortunatogeelhoed.com',
};

describe('applyAnalytics', () => {
	it('injects the cookieless tag with website id and domain into the head', () => {
		const out = applyAnalytics(PAGE, ANALYTICS);
		expect(out).toContain('src="https://stats.fortunatogeelhoed.com/script.js"');
		expect(out).toContain('data-website-id="abc-123"');
		expect(out).toContain('data-domains="fortunatogeelhoed.com"');
		// Lands inside the head, before it closes.
		expect(out.indexOf('data-website-id')).toBeLessThan(out.indexOf('</head>'));
	});

	it('returns the html unchanged when analytics is not configured', () => {
		expect(applyAnalytics(PAGE, null)).toBe(PAGE);
	});

	it('escapes attribute values so the tag cannot break out', () => {
		const out = applyAnalytics(PAGE, { ...ANALYTICS, websiteId: '"><script>x' });
		expect(out).not.toContain('"><script>x');
		expect(out).toContain('&quot;&gt;&lt;script&gt;x');
	});
});
