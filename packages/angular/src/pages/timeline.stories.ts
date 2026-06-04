import { provideRouter } from '@angular/router';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { TimelineComponent } from './timeline.component';

// The career timeline, authored as an Angular standalone component. A visual-parity subject.
const meta: Meta<TimelineComponent> = {
	title: 'Angular/Timeline',
	component: TimelineComponent,
	parameters: { layout: 'fullscreen' },
	decorators: [applicationConfig({ providers: [provideRouter([])] })],
};

export default meta;
type Story = StoryObj<TimelineComponent>;

export const Default: Story = {};
