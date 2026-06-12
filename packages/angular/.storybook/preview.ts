import { registerElements } from '@fg/shared/elements';
import type { Preview } from '@storybook/angular';
import { applyFramework, applyTheme, themeGlobalTypes } from '../../../.storybook/theme-decorator';

// Angular's builder cannot consume the Vite-shared preview module (CSS/JS imports differ),
// so this instance reproduces the equivalent wiring: global styles come from angular.json,
// and the shared web components are registered here (browser-only).
registerElements();

const preview: Preview = {
	parameters: {
		layout: 'centered',
		controls: { expanded: true },
		options: { storySort: { order: ['Web Components', 'React', 'Vue', 'Angular'] } },
	},
	globalTypes: themeGlobalTypes,
	initialGlobals: { theme: 'light' },
	decorators: [
		(story, ctx) => {
			applyTheme(ctx.globals.theme);
			applyFramework('angular');
			return story();
		},
	],
};

export default preview;
