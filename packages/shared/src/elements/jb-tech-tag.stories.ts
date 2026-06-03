import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

// Shadow-DOM badge with a <slot> and self-contained styles — the deliberate contrast to the
// light-DOM form controls. The --jb- tokens still reach it as inherited custom properties.
const meta: Meta = {
	title: 'Web Components/Tech Tag',
	component: 'jb-tech-tag',
	tags: ['autodocs'],
	render: (args) => html`<jb-tech-tag>${args.label}</jb-tech-tag>`,
	args: { label: 'TypeScript' },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const React: Story = { args: { label: 'React' } };

export const Vue: Story = { args: { label: 'Vue' } };

export const Angular: Story = { args: { label: 'Angular' } };
