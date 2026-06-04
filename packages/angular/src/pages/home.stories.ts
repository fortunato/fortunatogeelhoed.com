import { provideRouter } from '@angular/router';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { HomeComponent } from './home.component';

// The homepage, authored as an Angular standalone component. A cross-framework visual-parity
// subject: the same content and layout must render identically across React, Vue and Angular.
const meta: Meta<HomeComponent> = {
	title: 'Angular/Home',
	component: HomeComponent,
	parameters: { layout: 'fullscreen' },
	decorators: [applicationConfig({ providers: [provideRouter([])] })],
};

export default meta;
type Story = StoryObj<HomeComponent>;

export const Default: Story = {};
