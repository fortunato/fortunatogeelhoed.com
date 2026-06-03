import type { Preview } from '@storybook/web-components-vite';

// The portal hosts only the introduction page; each referenced section carries its own
// theme toolbar and decorators.
const preview: Preview = {
	parameters: {
		options: {
			storySort: { order: ['Introduction', 'Web Components', 'React', 'Vue', 'Angular'] },
		},
	},
};

export default preview;
