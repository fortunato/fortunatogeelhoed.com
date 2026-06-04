import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Home from './Home.vue';

// The homepage, authored as a Vue SFC. A cross-framework visual-parity subject: the same
// content and layout must render identically across React, Vue and Angular.
const meta: Meta<typeof Home> = {
	title: 'Vue/Home',
	component: Home,
	parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Home>;

export const Default: Story = {};
