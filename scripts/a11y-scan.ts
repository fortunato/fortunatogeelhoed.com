import { setTimeout as sleep } from 'node:timers/promises';
import { articlePathsFromPosts } from '@fg/shared';
import { routes } from '@fg/shared/types/routes';
import { getViolations, injectAxe } from 'axe-playwright';
import { chromium } from 'playwright';
import postsData from '../packages/content/posts.json';

// Every page a visitor can reach: the static routes plus one detail page per published article.
const scanPaths = [
	...routes.map((route) => route.path),
	...articlePathsFromPosts((postsData as { published: { slug: string }[] }).published),
];

// Live-site accessibility gate. Boots the production server over the built output and, for
// each framework variant, drives the real cookie-routing path to every route and runs axe
// at WCAG 2.1 AA plus axe's best-practice rules (so structural wins like a single <main>
// landmark and a per-page <h1> stay enforced). Any violation fails the build. This covers
// the actual pages a visitor receives — complementary to the per-story showcase checks.

const FRAMEWORKS = ['react', 'vue', 'angular'] as const;
const ORIGIN = 'http://localhost:3000';
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

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
		// Silence the server's per-request access log so the scan output stays readable;
		// genuine errors still surface on stderr.
		env: { ...process.env, NODE_ENV: 'production', LOG_LEVEL: 'silent' },
		stdout: 'inherit',
		stderr: 'inherit',
	});

	let failures = 0;
	const browser = await chromium.launch();
	try {
		await waitForServer();
		for (const framework of FRAMEWORKS) {
			// Pin scroll-revealed content to its final, fully-visible state so axe samples the
			// resolved rendering rather than a mid-animation frame (decorative reveals fade
			// opacity in, which would otherwise flag transient, non-real contrast failures and
			// make the gate non-deterministic). This also widens coverage: every section is
			// present at once instead of only what has scrolled into view.
			const context = await browser.newContext({ reducedMotion: 'reduce' });
			await context.addCookies([{ name: 'framework', value: framework, url: ORIGIN }]);
			const page = await context.newPage();
			for (const path of scanPaths) {
				await page.goto(`${ORIGIN}${path}`, { waitUntil: 'networkidle' });
				await injectAxe(page);
				const violations = await getViolations(page, undefined, {
					runOnly: { type: 'tag', values: AXE_TAGS },
				});
				if (violations.length > 0) {
					failures += violations.length;
					console.error(`\n✗ ${framework} ${path} — ${violations.length} violation(s):`);
					for (const v of violations) {
						console.error(
							`    [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`,
						);
					}
				} else {
					console.log(`✓ ${framework} ${path}`);
				}
			}
			await context.close();
		}
	} finally {
		await browser.close();
		server.kill();
	}

	if (failures > 0) {
		console.error(
			`\n${failures} accessibility violation(s) found (WCAG 2.1 AA + best practice).`,
		);
		process.exit(1);
	}
	console.log(
		`\nNo WCAG 2.1 AA / best-practice violations across ${scanPaths.length} paths × ${FRAMEWORKS.length} variants.`,
	);
}

await main();
