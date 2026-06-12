import { articlePath } from '@fg/shared';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { h } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import Article from './Article.vue';

// A single article, authored as a Vue SFC. A cross-framework visual-parity subject: the same
// rendered article must look identical across React, Vue and Angular. Registers a slug route on
// the preview's router and navigates to a fixed article so the story is deterministic.
const SLUG = 'too-react';

const meta: Meta<typeof Article> = {
	title: 'Vue/Article',
	component: Article,
	parameters: { layout: 'fullscreen' },
	render: () => ({
		components: { RouterView },
		setup() {
			const router = useRouter();
			if (!router.hasRoute('story-article')) {
				router.addRoute({
					name: 'story-article',
					path: '/writing/:slug',
					component: Article,
				});
			}
			router.push(articlePath(SLUG));
			return () => h(RouterView);
		},
	}),
};

export default meta;
type Story = StoryObj<typeof Article>;

export const Default: Story = {};
