import type { Preview } from '@storybook/web-components-vite';
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
			// Native elements show the neutral palette; framework sections supply their accent.
			applyFramework('neutral');
			return story();
		},
	],
};

export default preview;
