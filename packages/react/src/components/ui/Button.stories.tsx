import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import { Button } from './Button';

// The action primitive, rendered in React's accent. One polymorphic component covers buttons and
// links. Medium is the prominent body-font action (the CTA); small is the compact, monospace,
// accent-soft action used in dense rows (the timeline write-up + source links). The inverted
// variant is shown on an accent panel because that is where it lives (the CTA).
const meta: Meta<typeof Button> = {
	title: 'React/Foundations/Button',
	component: Button,
	parameters: { layout: 'centered' },
	decorators: [
		(Story) => (
			<MemoryRouter>
				<Story />
			</MemoryRouter>
		),
	],
	argTypes: {
		variant: {
			control: 'inline-radio',
			options: ['primary', 'inverted', 'secondary', 'ghost'],
		},
		size: { control: 'inline-radio', options: ['sm', 'md'] },
		tone: { control: 'inline-radio', options: ['plain', 'marketing'] },
		icon: { control: 'text' },
	},
	args: { variant: 'primary', size: 'md', tone: 'plain', children: 'Get in touch' },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

// Casing is a third axis: sentence-case by default (in-content), uppercase opt-in for headline
// CTAs (the homepage closing panel, the contact submit).
export const Marketing: Story = { args: { tone: 'marketing', children: 'Get in touch' } };

export const Secondary: Story = { args: { variant: 'secondary', children: 'View the timeline' } };

export const Ghost: Story = { args: { variant: 'ghost', children: 'Read more' } };

export const Inverted: Story = {
	args: { variant: 'inverted', children: 'Get in touch' },
	decorators: [
		(Story) => (
			<div
				style={{
					padding: '3rem',
					borderRadius: 'var(--jb-radius-sm)',
					background:
						'linear-gradient(135deg, var(--jb-accent), color-mix(in srgb, var(--jb-accent) 55%, #000))',
				}}
			>
				<Story />
			</div>
		),
	],
};

export const Small: Story = { args: { size: 'sm', to: '/blog', children: 'Read the write-up' } };

export const SmallExternal: Story = {
	args: {
		variant: 'secondary',
		size: 'sm',
		icon: 'github',
		href: 'https://github.com',
		children: 'Source',
	},
};

// The dense-row use the small size exists for — the timeline entry's write-up + source links.
export const CompactRow: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '0.5rem' }}>
			<Button size="sm" to="/blog">
				Read the write-up
			</Button>
			<Button variant="secondary" size="sm" icon="github" href="https://github.com">
				Source
			</Button>
		</div>
	),
};

export const AsInternalLink: Story = { args: { to: '/contact', children: 'Get in touch' } };

export const Disabled: Story = { args: { disabled: true, children: 'Get in touch' } };

// The contract at a glance: the prominent medium actions, then the compact small pair.
export const Matrix: Story = {
	render: () => (
		<div style={{ display: 'grid', gap: '1.5rem', justifyItems: 'start' }}>
			<div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
				<Button variant="primary">Primary</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="ghost">Ghost</Button>
			</div>
			<div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
				<Button size="sm" to="/blog">
					Small
				</Button>
				<Button variant="secondary" size="sm" href="https://github.com">
					Small external
				</Button>
			</div>
		</div>
	),
};
