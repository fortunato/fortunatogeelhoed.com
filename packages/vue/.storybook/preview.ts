import type { Preview } from '@storybook/vue3-vite';
import {
	applyFramework,
	applyTheme,
	sharedParameters,
	themeGlobalTypes,
} from '../../../.storybook/preview-shared';

const preview: Preview = {
	parameters: sharedParameters,
	globalTypes: themeGlobalTypes,
	initialGlobals: { theme: 'dark' },
	decorators: [
		(story, ctx) => {
			applyTheme(ctx.globals.theme);
			applyFramework('vue');
			return story();
		},
	],
};

export default preview;
