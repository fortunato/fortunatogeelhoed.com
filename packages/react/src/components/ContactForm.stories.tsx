import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ContactForm } from './ContactForm';

const meta: Meta<typeof ContactForm> = {
	title: 'React/Contact Form',
	component: ContactForm,
};

export default meta;
type Story = StoryObj<typeof ContactForm>;

export const Default: Story = {};

// Submitting an empty form surfaces the shared Zod validation messages.
export const Invalid: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Send' }));
		await expect(await canvas.findByText('Name is required')).toBeVisible();
	},
};

export const Disabled: Story = {
	args: { disabled: true },
};
