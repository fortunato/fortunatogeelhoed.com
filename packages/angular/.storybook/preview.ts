import 'zone.js';
import type { Preview } from '@analogjs/storybook-angular';
import {
	applyFramework,
	applyTheme,
	sharedParameters,
	themeGlobalTypes,
} from '../../../.storybook/preview-shared';

const preview: Preview = {
	parameters: sharedParameters,
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
