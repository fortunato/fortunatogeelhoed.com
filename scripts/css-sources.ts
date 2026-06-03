import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const STYLES_DIR = resolve(ROOT, 'styles');
// Web-component CSS is co-located with each element (e.g. jb-input.ts + jb-input.css).
const ELEMENTS_DIR = resolve(ROOT, 'packages/shared/src/elements');

// Single source of truth for the global stylesheet's composition and order, shared by
// the production build (build-css.ts), the Vite dev middleware (vite-css-dev.ts), and the
// Hono dev server (packages/api). Keeping this in one place avoids the three concatenation
// sites drifting out of sync.
//
// layers.css declares the @layer order and MUST load first. Each light-DOM web component
// ships a global CSS file next to its source; those load into the components layer. The
// shadow-DOM components (e.g. jb-tech-tag) carry their styles inside the component instead.
export function cssSourceFiles(): string[] {
	const elements = readdirSync(ELEMENTS_DIR)
		.filter((name) => name.endsWith('.css'))
		.sort()
		.map((name) => resolve(ELEMENTS_DIR, name));

	return [
		resolve(STYLES_DIR, 'layers.css'),
		resolve(STYLES_DIR, 'reset.css'),
		resolve(STYLES_DIR, 'tokens.css'),
		resolve(STYLES_DIR, 'base.css'),
		...elements,
		resolve(STYLES_DIR, 'motion.css'),
	];
}
