import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Button from './Button.vue';

// The action primitive, rendered in Vue's accent. Medium is the prominent body-font action (the
// CTA); small is the compact, monospace, accent-soft action for dense rows (the timeline links).
type Args = {
	variant: 'primary' | 'inverted' | 'secondary' | 'ghost';
	size: 'sm' | 'md';
	tone: 'plain' | 'marketing';
	icon?: string;
	label: string;
};

const meta: Meta<Args> = {
	title: 'Vue/Foundations/Button',
	component: Button,
	parameters: { layout: 'centered' },
	argTypes: {
		variant: {
			control: 'inline-radio',
			options: ['primary', 'inverted', 'secondary', 'ghost'],
		},
		size: { control: 'inline-radio', options: ['sm', 'md'] },
		tone: { control: 'inline-radio', options: ['plain', 'marketing'] },
		icon: { control: 'text' },
	},
	args: { variant: 'primary', size: 'md', tone: 'plain', label: 'Get in touch' },
	render: (args) => ({
		components: { Button },
		setup: () => ({ args }),
		template: '<Button v-bind="args">{{ args.label }}</Button>',
	}),
};

export default meta;
type Story = StoryObj<Args>;

export const Primary: Story = {};

// Casing is a third axis: sentence-case default; uppercase opt-in for headline CTAs.
export const Marketing: Story = { args: { tone: 'marketing', label: 'Get in touch' } };

export const Secondary: Story = { args: { variant: 'secondary', label: 'View the timeline' } };

export const Ghost: Story = { args: { variant: 'ghost', label: 'Read more' } };

export const Inverted: Story = {
	args: { variant: 'inverted', label: 'Get in touch' },
	render: (args) => ({
		components: { Button },
		setup: () => ({ args }),
		template: `
			<div style="padding:3rem;border-radius:var(--jb-radius-sm);background:linear-gradient(135deg, var(--jb-accent), color-mix(in srgb, var(--jb-accent) 55%, #000))">
				<Button v-bind="args">{{ args.label }}</Button>
			</div>`,
	}),
};

export const Small: Story = {
	render: () => ({
		components: { Button },
		template: '<Button size="sm" to="/blog">Read the write-up</Button>',
	}),
};

export const SmallExternal: Story = {
	render: () => ({
		components: { Button },
		template:
			'<Button variant="secondary" size="sm" icon="github" href="https://github.com">Source</Button>',
	}),
};

// The dense-row use the small size exists for — the timeline entry's write-up + source links.
export const CompactRow: Story = {
	render: () => ({
		components: { Button },
		template: `
			<div style="display:flex;gap:0.5rem">
				<Button size="sm" to="/blog">Read the write-up</Button>
				<Button variant="secondary" size="sm" icon="github" href="https://github.com">Source</Button>
			</div>`,
	}),
};

export const Matrix: Story = {
	render: () => ({
		components: { Button },
		template: `
			<div style="display:grid;gap:1.5rem;justify-items:start">
				<div style="display:flex;gap:1rem;align-items:center">
					<Button variant="primary">Primary</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="ghost">Ghost</Button>
				</div>
				<div style="display:flex;gap:0.5rem;align-items:center">
					<Button size="sm" to="/blog">Small</Button>
					<Button variant="secondary" size="sm" href="https://github.com">Small external</Button>
				</div>
			</div>`,
	}),
};
