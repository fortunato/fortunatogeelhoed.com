import type { StorybookConfig } from '@storybook/web-components-vite';

// The shared Lit web components, rendered directly as native custom elements.
// This is the parity anchor: the same jb-* elements the framework sections consume.
const config: StorybookConfig = {
	stories: ['../src/elements/*.stories.@(ts|mdx)'],
	addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
	framework: { name: '@storybook/web-components-vite', options: {} },
};

export default config;
