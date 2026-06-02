import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'dist/assets');

const reset = await Bun.file(resolve(root, 'styles/reset.css')).text();
const tokens = await Bun.file(resolve(root, 'styles/tokens.css')).text();
const base = await Bun.file(resolve(root, 'styles/base.css')).text();

const combined = `${reset}\n${tokens}\n${base}`;
const hash = createHash('md5').update(combined).digest('hex').slice(0, 8);
const filename = `styles-${hash}.css`;

await mkdir(outDir, { recursive: true });

// Clear stale hashed stylesheets from previous builds
for await (const stale of new Bun.Glob('styles-*.css').scan({ cwd: outDir })) {
	await rm(resolve(outDir, stale));
}

await writeFile(resolve(outDir, filename), combined);

// Write manifest so the shell can reference the hashed filename
await writeFile(resolve(outDir, 'manifest.json'), JSON.stringify({ 'styles.css': filename }));

console.log(`✓ Built ${filename} (${combined.length} bytes)`);
