import { resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

// React section. The shared aliases mirror the package's vite.config so stories can import
// real app components (which resolve @fg/shared and @styles). Storybook commands run from the
// repo root, so cwd-relative paths resolve consistently.
const root = process.cwd();

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(tsx|ts|mdx)'],
	addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
	framework: { name: '@storybook/react-vite', options: {} },
	viteFinal: async (cfg) => {
		cfg.resolve ??= {};
		cfg.resolve.alias = {
			...(cfg.resolve.alias ?? {}),
			'@fg/shared': resolve(root, 'packages/shared/src'),
			'@fg/content': resolve(root, 'packages/content/src'),
			'@styles': resolve(root, 'styles'),
		};
		return cfg;
	},
};

export default config;
