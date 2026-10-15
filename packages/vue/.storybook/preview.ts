import { setup } from '@storybook/vue3-vite';
import type { Preview } from '@storybook/vue3-vite';
import { createHead } from '@unhead/vue/client';
import { createMemoryHistory, createRouter } from 'vue-router';
import {
	applyFramework,
	applyTheme,
	sharedParameters,
	themeGlobalTypes,
} from '../../../.storybook/preview-shared';

// The Header uses <RouterLink>; provide a no-op memory router so it renders in isolation.
const router = createRouter({
	history: createMemoryHistory(),
	routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div></div>' } }],
});
// The Article page sets its <head> through useHead(), which throws without a head instance (in
// the app vite-ssg installs one).
setup((app) => {
	app.use(router);
	app.use(createHead());
});

const preview: Preview = {
	parameters: sharedParameters,
	globalTypes: themeGlobalTypes,
	initialGlobals: { theme: 'light' },
	decorators: [
		(story, ctx) => {
			applyTheme(ctx.globals.theme);
			applyFramework('vue');
			return story();
		},
	],
};

export default preview;
