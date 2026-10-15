import { dirname, resolve } from 'node:path';
import type { StorybookConfig } from '@analogjs/storybook-angular';
import { cssTargets } from '../../../scripts/css-targets.ts';

// Angular section. Built through AnalogJS's Vite framework, the same Angular compiler path as
// the live site (packages/angular/vite.config.ts), so all four sections share one builder.
// The aliases and CSS settings mirror that vite.config: lightningcss with CSS Modules off, so
// a shared *.module.css used as an Angular styleUrl is plain CSS scoped by ViewEncapsulation.
// Storybook commands run from the repo root, so cwd-relative paths resolve consistently.
const root = process.cwd();

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(ts|mdx)'],
	addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
	framework: {
		name: '@analogjs/storybook-angular',
		options: {
			// The app runs on zone.js; keep stories on the same change detection.
			experimentalZoneless: false,
			tsconfig: resolve(root, 'packages/angular/.storybook/tsconfig.json'),
		},
	},
	viteFinal: async (cfg) => {
		cfg.resolve ??= {};
		cfg.resolve.alias = {
			...(cfg.resolve.alias ?? {}),
			'@fg/shared': resolve(root, 'packages/shared/src'),
			'@fg/content-data': resolve(root, 'packages/content'),
			'@fg/content': resolve(root, 'packages/content/src'),
			'@styles': resolve(root, 'styles'),
		};
		cfg.css = {
			...cfg.css,
			transformer: 'lightningcss',
			lightningcss: { targets: cssTargets, cssModules: false },
		};
		// Stories compile in JIT mode, which imports each styleUrl as `angular:jit:style:file;<path>`.
		// AnalogJS resolves that to `<path>?inline` (the stylesheet as a string), but on Vite 8 an
		// earlier resolver claims it as a plain CSS file first, which has no default export and fails
		// the build. Resolve it the way AnalogJS intends before anything else sees it.
		cfg.plugins = [
			{
				name: 'jit-style-inline',
				enforce: 'pre',
				resolveId(id, importer) {
					if (!id.startsWith('angular:jit:style:file;') || !importer) return;
					return `${resolve(dirname(importer), id.slice(id.indexOf(';') + 1))}?inline`;
				},
			},
			...(cfg.plugins ?? []),
		];
		return cfg;
	},
};

export default config;
