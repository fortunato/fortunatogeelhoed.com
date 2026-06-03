import type { StorybookConfig } from '@storybook/web-components-vite';

// Composition root (portal). It owns no component stories — only the introduction page —
// and federates the four technology sections via refs. In a production build the refs are
// RELATIVE, same-origin paths (the sections are assembled as sibling folders), so the
// composed catalogue needs no CORS and loads from one origin. In dev they point at each
// section's local dev server.
const config: StorybookConfig = {
	stories: ['./*.mdx'],
	addons: ['@storybook/addon-docs'],
	framework: { name: '@storybook/web-components-vite', options: {} },
	refs: (_config, { configType }) => {
		if (configType === 'DEVELOPMENT') {
			return {
				'web-components': { title: 'Web Components', url: 'http://localhost:6007' },
				react: { title: 'React', url: 'http://localhost:6008' },
				vue: { title: 'Vue', url: 'http://localhost:6009' },
				angular: { title: 'Angular', url: 'http://localhost:6010' },
			};
		}
		return {
			'web-components': { title: 'Web Components', url: './web-components' },
			react: { title: 'React', url: './react' },
			vue: { title: 'Vue', url: './vue' },
			angular: { title: 'Angular', url: './angular' },
		};
	},
};

export default config;
