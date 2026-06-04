import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Rewrites the unhashed stylesheet link baked into each framework's index.html
// to the content-hashed filename, so production serves the immutable hashed
// asset (the unhashed /assets/styles.css is never emitted). Runs after the
// frameworks have pre-rendered their HTML.

// Pure transform, extracted so it can be verified in isolation.
export function rewriteStylesheetLink(html: string, hashed: string): string {
	return html.replaceAll('/assets/styles.css', `/assets/${hashed}`);
}

async function main() {
	const root = resolve(import.meta.dirname, '..');
	const distDir = resolve(root, 'dist');

	const manifest = await Bun.file(resolve(distDir, 'assets/manifest.json')).json();
	const hashed = manifest['styles.css'];
	if (!hashed) {
		throw new Error(
			'dist/assets/manifest.json missing "styles.css" entry — run build:css first',
		);
	}

	let rewritten = 0;
	for await (const file of new Bun.Glob('{react,vue,angular}/**/*.html').scan({ cwd: distDir })) {
		const path = resolve(distDir, file);
		const html = await readFile(path, 'utf8');
		const next = rewriteStylesheetLink(html, hashed);
		if (next !== html) {
			await writeFile(path, next);
			rewritten++;
		}
	}

	console.log(`✓ Rewrote stylesheet link → /assets/${hashed} in ${rewritten} files`);
}

// Only run the file-walking side effects when executed directly (bun run …),
// never on import (the pure helper above is what tests exercise).
if (import.meta.main) {
	await main();
}
