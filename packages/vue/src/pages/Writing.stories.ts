import contentData from '@fg/content-data/data.json';
import type { ContentItem } from '@fg/shared';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { setContent } from '../composables/useContent';
import Writing from './Writing.vue';

// The writing index, authored as a Vue SFC. A cross-framework visual-parity subject: the same
// content and layout must render identically across React, Vue and Angular. Seeded with the real
// content so the heading and intro match the other two builds.
setContent(contentData as Record<string, ContentItem>);

const meta: Meta<typeof Writing> = {
	title: 'Vue/Writing',
	component: Writing,
	parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Writing>;

export const Default: Story = {};
