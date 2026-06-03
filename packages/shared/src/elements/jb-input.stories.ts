import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

// The form-associated, light-DOM text input. Styled by the global @layer stylesheet
// through inherited --jb- tokens (no shadow boundary to pierce).
const meta: Meta = {
	title: 'Web Components/Input',
	component: 'jb-input',
	tags: ['autodocs'],
	render: (args) => html`
		<jb-input
			label=${args.label}
			name=${args.name}
			type=${args.type}
			placeholder=${args.placeholder}
			.value=${args.value}
			?required=${args.required}
			?disabled=${args.disabled}
		></jb-input>
	`,
	args: {
		label: 'Email',
		name: 'email',
		type: 'email',
		placeholder: 'you@example.com',
		value: '',
		required: false,
		disabled: false,
	},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Filled: Story = { args: { value: 'fortunato@example.com' } };

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { value: 'fortunato@example.com', disabled: true } };

