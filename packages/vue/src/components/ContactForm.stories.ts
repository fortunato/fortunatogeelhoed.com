import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ContactForm from './ContactForm.vue';

const meta: Meta<typeof ContactForm> = {
	title: 'Vue/Contact Form',
	component: ContactForm,
};

export default meta;
type Story = StoryObj<typeof ContactForm>;

export const Default: Story = {};
