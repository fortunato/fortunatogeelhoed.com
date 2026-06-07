import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Fail fast with a clear message when the build runs on a Node version that lacks require(ESM).
// The Angular build (via @angular/build) require()s @angular/compiler-cli's ESM linker, which only
// works on Node >= 22. On older Node it dies several seconds in with a cryptic ERR_REQUIRE_ESM deep
// in the toolchain; this turns that into one actionable line up front. Run under the same `node`
// the build uses (not Bun), so it sees the real runtime.
const MIN_MAJOR = 22;
const current = Number(process.versions.node.split('.')[0]);

if (current < MIN_MAJOR) {
	let pinned = `${MIN_MAJOR} or newer`;
	try {
		pinned = readFileSync(fileURLToPath(new URL('../.nvmrc', import.meta.url)), 'utf8').trim();
	} catch {
		// .nvmrc is optional context; the requirement stands without it.
	}
	console.error(
		`\n✗ This build needs Node >= ${MIN_MAJOR}; active is ${process.version}.
  The Angular build require()s an ESM module, which only works on Node >= 22.
  This repo pins ${pinned} in .nvmrc — run \`nvm use\` (or install Node ${pinned}).\n`,
	);
	process.exit(1);
}
