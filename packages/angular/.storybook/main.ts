import type { StorybookConfig } from '@storybook/angular';

// Angular section. Unlike the other three, @storybook/angular uses Angular's own builder
// (not the AnalogJS Vite path) — the one deliberate divergence. Global styles, the zone.js
// polyfill, and the tsConfig come from the Storybook-scoped build target in angular.json.
const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(ts|mdx)'],
	addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
	framework: { name: '@storybook/angular', options: {} },
};

export default config;
