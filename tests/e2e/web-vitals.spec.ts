import { expect, test } from '@playwright/test';

// Core Web Vitals budget, asserted against the built site over the production server.
// LCP and CLS are hard limits on both pages; CLS in particular guards the motion layer —
// reveals and transitions animate transform/opacity only, so they must shift nothing.
// Interaction latency (an INP proxy from the longest event-processing duration) is held to
// the "good" 200ms bar on the homepage. The desktop timeline runs Lenis smooth scroll, so
// it carries a slightly wider allowance — still well inside a responsive feel.
const ORIGIN = 'http://localhost:3000';
const FRAMEWORKS = ['react', 'vue', 'angular'] as const;

const LCP_BUDGET_MS = 2500;
const CLS_BUDGET = 0.1;
const INP_BUDGET_MS = 200;
const TIMELINE_INP_BUDGET_MS = 300;

interface Vitals {
	lcp: number;
	cls: number;
	inp: number;
}

// Installed before any document script so the observers catch the whole page lifecycle.
const COLLECTOR = `
	window.__vitals = { lcp: 0, cls: 0, inp: 0 };
	new PerformanceObserver((list) => {
		for (const e of list.getEntries()) window.__vitals.lcp = e.startTime;
	}).observe({ type: 'largest-contentful-paint', buffered: true });
	new PerformanceObserver((list) => {
		for (const e of list.getEntries()) {
			if (!e.hadRecentInput) window.__vitals.cls += e.value;
		}
	}).observe({ type: 'layout-shift', buffered: true });
	new PerformanceObserver((list) => {
		for (const e of list.getEntries()) {
			window.__vitals.inp = Math.max(window.__vitals.inp, e.duration);
		}
	}).observe({ type: 'event', durationThreshold: 16, buffered: true });
`;

async function measure(
	browser: import('@playwright/test').Browser,
	framework: string,
	path: string,
) {
	const context = await browser.newContext();
	await context.addCookies([{ name: 'framework', value: framework, url: ORIGIN }]);
	const page = await context.newPage();
	await page.addInitScript(COLLECTOR);
	await page.goto(path, { waitUntil: 'networkidle' });

	// Drive a few real interactions so the INP proxy has something to measure, and scroll the
	// full page so any deferred content settles (and would surface as layout shift if present).
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	const toggle = page.locator('jb-theme-toggle').first();
	if (await toggle.count()) await toggle.click();
	await page.mouse.wheel(0, 2000);
	await page.waitForTimeout(400);
	await page.mouse.wheel(0, 4000);
	await page.waitForTimeout(400);

	const vitals = (await page.evaluate(() => window.__vitals)) as Vitals;
	await context.close();
	return vitals;
}

declare global {
	interface Window {
		__vitals: Vitals;
	}
}

test.describe('core web vitals budget', () => {
	for (const framework of FRAMEWORKS) {
		test(`homepage stays within budget in ${framework}`, async ({ browser }) => {
			const { lcp, cls, inp } = await measure(browser, framework, '/');
			expect(lcp).toBeLessThanOrEqual(LCP_BUDGET_MS);
			expect(cls).toBeLessThanOrEqual(CLS_BUDGET);
			expect(inp).toBeLessThanOrEqual(INP_BUDGET_MS);
		});

		test(`timeline stays within budget in ${framework}`, async ({ browser }) => {
			const { lcp, cls, inp } = await measure(browser, framework, '/timeline');
			expect(lcp).toBeLessThanOrEqual(LCP_BUDGET_MS);
			expect(cls).toBeLessThanOrEqual(CLS_BUDGET);
			expect(inp).toBeLessThanOrEqual(TIMELINE_INP_BUDGET_MS);
		});
	}
});
