import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ButtonDirective } from './button.directive';

// The action primitive, rendered in Angular's accent, as an attribute directive on a real <a>/
// <button>. Medium is the prominent body-font action (the CTA); small is the compact, monospace,
// accent-soft action for dense rows (the timeline write-up + source links).
type Args = {
	variant: 'primary' | 'inverted' | 'secondary' | 'ghost';
	size: 'sm' | 'md';
	tone: 'plain' | 'marketing';
	label: string;
};

const meta: Meta<Args> = {
	title: 'Angular/Foundations/Button',
	decorators: [moduleMetadata({ imports: [ButtonDirective], schemas: [CUSTOM_ELEMENTS_SCHEMA] })],
	parameters: { layout: 'centered' },
	argTypes: {
		variant: {
			control: 'inline-radio',
			options: ['primary', 'inverted', 'secondary', 'ghost'],
		},
		size: { control: 'inline-radio', options: ['sm', 'md'] },
		tone: { control: 'inline-radio', options: ['plain', 'marketing'] },
	},
	args: { variant: 'primary', size: 'md', tone: 'plain', label: 'Get in touch' },
	render: (args) => ({
		props: args,
		template:
			'<button jbButton [variant]="variant" [size]="size" [tone]="tone">{{ label }}</button>',
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
		props: args,
		template: `
			<div style="padding:3rem;border-radius:var(--jb-radius-sm);background:linear-gradient(135deg, var(--jb-accent), color-mix(in srgb, var(--jb-accent) 55%, #000))">
				<button jbButton variant="inverted" [size]="size">{{ label }}</button>
			</div>`,
	}),
};

export const Small: Story = {
	args: { size: 'sm', label: 'Read the write-up' },
	render: (args) => ({
		props: args,
		template: '<a jbButton [size]="size" href="#">{{ label }}</a>',
	}),
};

export const SmallExternal: Story = {
	args: { variant: 'secondary', size: 'sm', label: 'Source' },
	render: (args) => ({
		props: args,
		template:
			'<a jbButton [variant]="variant" [size]="size" href="https://github.com"><jb-icon name="github"></jb-icon>{{ label }}</a>',
	}),
};

// The dense-row use the small size exists for — the timeline entry's write-up + source links.
export const CompactRow: Story = {
	render: () => ({
		template: `
			<div style="display:flex;gap:0.5rem">
				<a jbButton size="sm" href="#">Read the write-up</a>
				<a jbButton variant="secondary" size="sm" href="https://github.com"><jb-icon name="github"></jb-icon>Source</a>
			</div>`,
	}),
};

export const Matrix: Story = {
	render: () => ({
		template: `
			<div style="display:grid;gap:1.5rem;justify-items:start">
				<div style="display:flex;gap:1rem;align-items:center">
					<button jbButton variant="primary">Primary</button>
					<button jbButton variant="secondary">Secondary</button>
					<button jbButton variant="ghost">Ghost</button>
				</div>
				<div style="display:flex;gap:0.5rem;align-items:center">
					<a jbButton size="sm" href="#">Small</a>
					<a jbButton variant="secondary" size="sm" href="https://github.com">Small external</a>
				</div>
			</div>`,
	}),
};
