import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Header from './Header.vue';

// The site header (and primary nav), authored as a Vue SFC. Shown for completeness; not a
// visual-parity subject (the active framework-switcher button differs per section by design).
const meta: Meta<typeof Header> = {
	title: 'Vue/Header',
	component: Header,
	parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {};
