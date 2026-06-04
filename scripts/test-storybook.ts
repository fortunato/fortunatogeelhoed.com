import { setTimeout as sleep } from 'node:timers/promises';

// Per-story accessibility + smoke gate for the showcase. The catalogue is a *composed*
// build: the portal root only lists its Introduction, and each technology's stories live
// under their own sub-path with their own index. So a single bare `test-storybook` run
// against the root tests nothing useful — instead we serve the assembled static tree once
// and run the runner per section, pointing it at that section's config (to enumerate the
// stories) and its served URL (where they live). Requires `bun run build-storybook` first.

const PORT = Number(process.env.PORT ?? 6107);
const ORIGIN = `http://localhost:${PORT}`;

const SECTIONS = [
	{ name: 'react', config: 'packages/react/.storybook' },
	{ name: 'vue', config: 'packages/vue/.storybook' },
	{ name: 'angular', config: 'packages/angular/.storybook' },
	{ name: 'web-components', config: 'packages/shared/.storybook' },
];

async function waitForServer(timeoutMs = 30_000): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			if ((await fetch(`${ORIGIN}/index.json`)).ok) return;
		} catch {
			// not up yet
		}
		await sleep(300);
	}
	throw new Error(`Static showcase did not respond at ${ORIGIN} within ${timeoutMs}ms`);
}

const server = Bun.spawn(['bun', 'run', 'scripts/serve-storybook-static.ts'], {
	env: { ...process.env, PORT: String(PORT) },
	stdout: 'ignore',
	stderr: 'inherit',
});

let failed = 0;
try {
	await waitForServer();
	for (const section of SECTIONS) {
		console.log(`\n── ${section.name} ──`);
		const run = Bun.spawn(
			[
				'./node_modules/.bin/test-storybook',
				'-c',
				section.config,
				'--url',
				`${ORIGIN}/${section.name}`,
				'--browsers',
				'chromium',
			],
			{ stdout: 'inherit', stderr: 'inherit' },
		);
		if ((await run.exited) !== 0) failed++;
	}
} finally {
	server.kill();
}

if (failed > 0) {
	console.error(`\n${failed} showcase section(s) failed the accessibility/smoke gate.`);
	process.exit(1);
}
console.log('\nAll showcase sections passed the accessibility + smoke gate.');
