// Browser-only preview wiring reused by the Vite-based instances (web components, React, Vue).
// It loads the global layered stylesheet in the same order as the production build
// (see scripts/css-sources.ts) and registers the shared web components so framework
// stories that consume <jb-*> render the real elements.
//
// Angular's instance cannot import CSS/JS this way (its builder differs), so it reproduces
// the equivalent wiring in its own preview — the one deliberate divergence (see research §2).
import '../styles/layers.css';
import '../styles/fonts.css';
import '../styles/reset.css';
import '../styles/tokens.css';
import '../styles/base.css';
import '../packages/shared/src/elements/jb-input.css';
import '../packages/shared/src/elements/jb-textarea.css';
import '../packages/shared/src/elements/jb-theme-toggle.css';
import '../styles/motion.css';
import { registerElements } from '../packages/shared/src/elements';

// Explicit call, never a bare side-effecting import — bundlers tree-shake the latter
// (the same reason the app client bootstraps call it). Browser-only: safe in previews.
registerElements();

export { applyTheme, applyFramework, themeGlobalTypes } from './theme-decorator';

// Defaults every section shares; instances spread these into their own preview.
export const sharedParameters = {
	layout: 'centered' as const,
	controls: { expanded: true },
	options: {
		storySort: { order: ['Web Components', 'React', 'Vue', 'Angular'] },
	},
};
