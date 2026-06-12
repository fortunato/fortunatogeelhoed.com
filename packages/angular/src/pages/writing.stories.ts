import { provideRouter } from '@angular/router';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { WritingComponent } from './writing.component';

// The writing index, authored as an Angular standalone component. A cross-framework visual-parity
// subject: the same content and layout must render identically across React, Vue and Angular. The
// root content service supplies the heading and intro, matching the other two builds.
const meta: Meta<WritingComponent> = {
	title: 'Angular/Writing',
	component: WritingComponent,
	parameters: { layout: 'fullscreen' },
	decorators: [applicationConfig({ providers: [provideRouter([])] })],
};

export default meta;
type Story = StoryObj<WritingComponent>;

export const Default: Story = {};
