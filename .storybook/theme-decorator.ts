// Shared theming for every Storybook instance. Reuses the live site's theme
// persistence (packages/shared/src/theme.ts) so toggling the theme here drives the
// exact same `data-theme` + `--jb-` tokens as the production site — one source of truth.
//
// Storybook decorators are renderer-specific in how they RETURN a story, so each
// instance keeps its own one-line decorator; the shared parts (the side effect that
// applies the theme, the framework accent, and the toolbar definition) live here.
import { setTheme } from '../packages/shared/src/theme';

export type FrameworkAccent = 'react' | 'vue' | 'angular' | 'neutral';

// Toolbar dropdown exposed by every instance so a visitor can switch theme in-place.
export const themeGlobalTypes = {
	theme: {
		description: 'Color theme',
		defaultValue: 'light',
		toolbar: {
			title: 'Theme',
			items: [
				{ value: 'dark', title: 'Dark' },
				{ value: 'light', title: 'Light' },
			],
			dynamicTitle: true,
		},
	},
};

/** Apply the selected theme exactly as the live site does (attribute + cookie + storage). */
export function applyTheme(theme: string | undefined): void {
	setTheme(theme === 'dark' ? 'dark' : 'light');
}

/**
 * Select which framework accent the section renders, via the same `data-framework` hook the
 * site uses. `neutral` is for the framework-agnostic Web Components section: it applies a
 * brand-neutral accent rather than letting the elements inherit the global default (which is
 * React's), so the shared primitives don't appear tied to any one framework.
 */
export function applyFramework(name: FrameworkAccent): void {
	const root = document.documentElement;
	if (name === 'neutral') {
		root.removeAttribute('data-framework');
		root.style.setProperty('--jb-accent', 'var(--jb-color-neutral-500)');
	} else {
		root.style.removeProperty('--jb-accent');
		root.setAttribute('data-framework', name);
	}
}
