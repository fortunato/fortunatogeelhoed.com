import { resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/vue3-vite';
import vue from '@vitejs/plugin-vue';

// Vue section. Aliases mirror the package vite.config so stories can import real app components.
// Storybook's bundled Vue plugin does not set isCustomElement, so SFC composites (Header,
// ContactForm) that use <jb-*> tags would be treated as Vue components. We swap in our own
// Vue plugin configured exactly like the live app's vite.config so the tags compile as native
// custom elements (props as DOM properties, native input/blur events).
const root = process.cwd();

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(ts|mdx)'],
	addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
	framework: { name: '@storybook/vue3-vite', options: {} },
	viteFinal: async (cfg) => {
		cfg.plugins = (cfg.plugins ?? []).filter(
			(p) => !(p && typeof p === 'object' && 'name' in p && p.name === 'vite:vue'),
		);
		cfg.plugins.unshift(
			vue({
				template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('jb-') } },
			}),
		);
		cfg.resolve ??= {};
		cfg.resolve.alias = {
			...(cfg.resolve.alias ?? {}),
			'@fg/shared': resolve(root, 'packages/shared/src'),
			'@fg/content-data': resolve(root, 'packages/content'),
			'@fg/content': resolve(root, 'packages/content/src'),
			'@styles': resolve(root, 'styles'),
		};
		return cfg;
	},
};

export default config;
