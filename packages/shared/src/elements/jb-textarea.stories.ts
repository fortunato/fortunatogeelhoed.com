import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
	title: 'Web Components/Textarea',
	component: 'jb-textarea',
	tags: ['autodocs'],
	render: (args) => html`
		<jb-textarea
			label=${args.label}
			name=${args.name}
			placeholder=${args.placeholder}
			.value=${args.value}
			?required=${args.required}
			?disabled=${args.disabled}
		></jb-textarea>
	`,
	args: {
		label: 'Message',
		name: 'message',
		placeholder: 'Tell me about your project…',
		value: '',
		required: false,
		disabled: false,
	},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Filled: Story = {
	args: { value: 'I have a React + Vue + Angular migration I would love your help with.' },
};

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { value: 'Sent already.', disabled: true } };

