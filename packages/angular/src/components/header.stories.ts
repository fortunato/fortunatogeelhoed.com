import { provideRouter } from '@angular/router';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { HeaderComponent } from './header.component';

const meta: Meta<HeaderComponent> = {
	title: 'Angular/Header',
	component: HeaderComponent,
	parameters: { layout: 'fullscreen' },
	decorators: [applicationConfig({ providers: [provideRouter([])] })],
};

export default meta;
type Story = StoryObj<HeaderComponent>;

export const Default: Story = {};
