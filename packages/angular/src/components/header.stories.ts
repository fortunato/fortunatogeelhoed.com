import type { Meta, StoryObj } from '@analogjs/storybook-angular';
import { applicationConfig } from '@analogjs/storybook-angular';
import { provideRouter } from '@angular/router';
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
