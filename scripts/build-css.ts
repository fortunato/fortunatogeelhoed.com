import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { transform } from 'lightningcss';
import { cssSourceFiles } from './css-sources';
import { cssTargets } from './css-targets';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'dist/assets');

// Ordered global stylesheet sources (see css-sources.ts — the single source of truth).
const combined = (await Promise.all(cssSourceFiles().map((file) => Bun.file(file).text()))).join(
	'\n',
);

// Prefix + downlevel to the Baseline floor and minify.
const { code } = transform({
	filename: 'styles.css',
	code: Buffer.from(combined),
	targets: cssTargets,
	minify: true,
});

const hash = createHash('md5').update(code).digest('hex').slice(0, 8);
const filename = `styles-${hash}.css`;

await mkdir(outDir, { recursive: true });

// Clear stale hashed stylesheets from previous builds
for await (const stale of new Bun.Glob('styles-*.css').scan({ cwd: outDir })) {
	await rm(resolve(outDir, stale));
}

await writeFile(resolve(outDir, filename), code);

// Write manifest so the shell can reference the hashed filename
await writeFile(resolve(outDir, 'manifest.json'), JSON.stringify({ 'styles.css': filename }));

console.log(`✓ Built ${filename} (${code.length} bytes)`);
