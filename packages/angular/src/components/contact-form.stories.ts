import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { ContactFormComponent } from './contact-form.component';

const meta: Meta<ContactFormComponent> = {
	title: 'Angular/Contact Form',
	component: ContactFormComponent,
};

export default meta;
type Story = StoryObj<ContactFormComponent>;

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
