import { setTimeout as sleep } from 'node:timers/promises';
import { getViolations, injectAxe } from 'axe-playwright';
import { chromium } from 'playwright';
import { routes } from '../packages/shared/src/types/routes';

// Live-site accessibility gate. Boots the production server over the built output and, for
// each framework variant, drives the real cookie-routing path to every route and runs axe
// at WCAG 2.1 AA. Any violation fails the build. This covers the actual pages a visitor
// receives — complementary to the per-story accessibility checks in the showcase.

const FRAMEWORKS = ['react', 'vue', 'angular'] as const;
const ORIGIN = 'http://localhost:3000';
const WCAG_2_1_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function waitForServer(timeoutMs = 30_000): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			const res = await fetch(`${ORIGIN}/`);
			if (res.ok) return;
		} catch {
			// server not up yet
		}
		await sleep(500);
	}
	throw new Error(`Production server did not respond at ${ORIGIN} within ${timeoutMs}ms`);
}

async function main() {
	// Serve the built site exactly as it ships. Requires `bun run build` to have produced dist/.
	const server = Bun.spawn(['bun', 'run', 'packages/api/src/index.ts'], {
		env: { ...process.env, NODE_ENV: 'production' },
		stdout: 'inherit',
		stderr: 'inherit',
	});

	let failures = 0;
	const browser = await chromium.launch();
	try {
		await waitForServer();
		for (const framework of FRAMEWORKS) {
			const context = await browser.newContext();
			await context.addCookies([{ name: 'framework', value: framework, url: ORIGIN }]);
			const page = await context.newPage();
			for (const route of routes) {
				await page.goto(`${ORIGIN}${route.path}`, { waitUntil: 'networkidle' });
				await injectAxe(page);
				const violations = await getViolations(page, undefined, {
					runOnly: { type: 'tag', values: WCAG_2_1_AA },
				});
				if (violations.length > 0) {
					failures += violations.length;
					console.error(
						`\n✗ ${framework} ${route.path} — ${violations.length} violation(s):`,
					);
					for (const v of violations) {
						console.error(
							`    [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`,
						);
					}
				} else {
					console.log(`✓ ${framework} ${route.path}`);
				}
			}
			await context.close();
		}
	} finally {
		await browser.close();
		server.kill();
	}

	if (failures > 0) {
		console.error(`\n${failures} WCAG 2.1 AA violation(s) found.`);
		process.exit(1);
	}
	console.log(
		`\nNo WCAG 2.1 AA violations across ${routes.length} routes × ${FRAMEWORKS.length} variants.`,
	);
}

await main();
