import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Builds the four technology Storybooks plus the composition portal and assembles them into a
// single static tree at dist/storybook. Fail-loud: if ANY instance build fails the script
// exits non-zero and the catalogue is NOT published (the CI deploy step is gated on success),
// so a partial catalogue that misrepresents coverage can never ship.
//
// Order matters: the portal builds first because it owns the tree root and clears it; each
// section then builds into its own subfolder (which only that build clears). The portal's refs
// are relative, same-origin paths to those subfolders, so the composed catalogue loads from one
// origin with no CORS.
const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'dist/storybook');
const HOST = 'components.fortunatogeelhoed.com';

type Step = { name: string; cmd: string[] };

// A non-empty tuple: the portal build always leads, so destructuring it off the front is sound.
const steps: [Step, ...Step[]] = [
	{ name: 'portal', cmd: ['storybook', 'build', '-c', '.storybook', '-o', 'dist/storybook'] },
	{
		name: 'web-components',
		cmd: [
			'storybook',
			'build',
			'-c',
			'packages/shared/.storybook',
			'-o',
			'dist/storybook/web-components',
		],
	},
	{
		name: 'react',
		cmd: [
			'storybook',
			'build',
			'-c',
			'packages/react/.storybook',
			'-o',
			'dist/storybook/react',
		],
	},
	{
		name: 'vue',
		cmd: ['storybook', 'build', '-c', 'packages/vue/.storybook', '-o', 'dist/storybook/vue'],
	},
	// Angular uses its own builder (not Vite); outputDir is set in angular.json.
	{ name: 'angular', cmd: ['ng', 'run', 'angular:build-storybook'] },
];

async function run(step: Step): Promise<void> {
	console.log(`\n▸ building ${step.name}…`);
	const proc = Bun.spawn(['bunx', ...step.cmd], {
		cwd: root,
		stdout: 'inherit',
		stderr: 'inherit',
	});
	const code = await proc.exited;
	if (code !== 0) {
		console.error(
			`\n✗ ${step.name} build failed (exit ${code}) — not publishing a partial catalogue.`,
		);
		process.exit(code || 1);
	}
}

// The portal owns and clears the tree root, so it must finish before anything writes a subfolder.
// The four section builds each own a distinct subfolder and are independent, so they run together.
const [portal, ...sectionSteps] = steps;
await run(portal);
await Promise.all(sectionSteps.map(run));

// Verify every section is present and reachable from one origin (each must expose index.json).
const sections = ['web-components', 'react', 'vue', 'angular'];
for (const section of sections) {
	const index = Bun.file(resolve(out, section, 'index.json'));
	if (!(await index.exists())) {
		console.error(`✗ ${section}/index.json missing — composition would be incomplete.`);
		process.exit(1);
	}
}

// Custom domain so GitHub Pages serves from root (no base-path juggling).
await mkdir(out, { recursive: true });
await writeFile(resolve(out, 'CNAME'), `${HOST}\n`);
// `.nojekyll` so Pages serves Storybook's _-prefixed asset folders untouched.
await rm(resolve(out, '.nojekyll'), { force: true });
await writeFile(resolve(out, '.nojekyll'), '');

console.log(`\n✓ Assembled showcase at dist/storybook (portal + ${sections.join(', ')}) → ${HOST}`);
