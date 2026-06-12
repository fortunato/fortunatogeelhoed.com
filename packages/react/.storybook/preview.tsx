import type { Preview } from '@storybook/react-vite';
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
		(Story, ctx) => {
			applyTheme(ctx.globals.theme);
			applyFramework('react');
			return <Story />;
		},
	],
};

export default preview;
