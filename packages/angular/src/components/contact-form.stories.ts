import type { Meta, StoryObj } from '@storybook/angular';
import { ContactFormComponent } from './contact-form.component';

const meta: Meta<ContactFormComponent> = {
	title: 'Angular/Contact Form',
	component: ContactFormComponent,
};

export default meta;
type Story = StoryObj<ContactFormComponent>;

export const Default: Story = {};
