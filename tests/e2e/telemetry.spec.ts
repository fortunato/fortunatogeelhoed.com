import { expect, test } from '@playwright/test';

// Frontend real-user-monitoring (Grafana Faro), end-to-end. RUM is best-effort and dynamically
// imported off the critical path, so it cannot be unit tested meaningfully; only a real browser
// run exercises the load/idle scheduling, the dynamic import, and the transport. The collector is
// not reachable in test, so the post to our first-party /api/rum proxy is intercepted: this proves
// telemetry initialises and dispatches events without a live backend. A thrown error is the most
// deterministic trigger, since the errors instrumentation flushes it promptly.
const ORIGIN = 'http://localhost:3000';
const FRAMEWORKS = ['react', 'vue', 'angular'] as const;

interface FaroPayload {
	meta?: { app?: { name?: string; namespace?: string } };
	events?: unknown[];
	exceptions?: unknown[];
	measurements?: unknown[];
}

test.describe('frontend telemetry', () => {
	for (const framework of FRAMEWORKS) {
		test(`initialises Faro and dispatches an event to /api/rum in ${framework}`, async ({
			browser,
		}) => {
			const context = await browser.newContext();
			await context.addCookies([{ name: 'framework', value: framework, url: ORIGIN }]);
			const page = await context.newPage();

			// Capture every telemetry post and answer 204 (as the real proxy does), so nothing
			// depends on a live collector.
			const payloads: FaroPayload[] = [];
			await page.route('**/api/rum', async (route) => {
				const body = route.request().postDataJSON() as FaroPayload | null;
				if (body) payloads.push(body);
				await route.fulfill({ status: 204, body: '' });
			});

			await page.goto('/', { waitUntil: 'load' });

			// RUM schedules on idle; nudge the browser past idle, then raise an error the errors
			// instrumentation will capture and flush to the transport.
			await page.evaluate(
				() =>
					new Promise<void>((resolve) => {
						const fire = () => {
							setTimeout(() => {
								window.dispatchEvent(
									new ErrorEvent('error', {
										message: 'telemetry-e2e-probe',
										error: new Error('telemetry-e2e-probe'),
									}),
								);
								resolve();
							}, 50);
						};
						if ('requestIdleCallback' in window) {
							(window as Window & typeof globalThis).requestIdleCallback(fire);
						} else {
							setTimeout(fire, 100);
						}
					}),
			);

			// Faro batches, so allow a moment for at least one transport flush to reach the proxy.
			await expect.poll(() => payloads.length, { timeout: 10_000 }).toBeGreaterThan(0);

			// The payload identifies our one Faro app, namespaced by framework.
			const appMeta = payloads.map((p) => p.meta?.app).find((app) => app?.name);
			expect(appMeta?.name).toBe('fortunatogeelhoed.com');
			expect(appMeta?.namespace).toBe(framework);

			await context.close();
		});
	}
});
