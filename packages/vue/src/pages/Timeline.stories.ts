import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Timeline from './Timeline.vue';

// The career timeline, authored as a Vue SFC. A cross-framework visual-parity subject.
const meta: Meta<typeof Timeline> = {
	title: 'Vue/Timeline',
	component: Timeline,
	parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Timeline>;

export const Default: Story = {};
