import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

// Light-DOM button that flips the persisted light/dark theme (the same control the site uses).
const meta: Meta = {
	title: 'Web Components/Theme Toggle',
	component: 'jb-theme-toggle',
	tags: ['autodocs'],
	render: () => html`<jb-theme-toggle></jb-theme-toggle>`,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
