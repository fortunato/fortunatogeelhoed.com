import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import { Timeline } from './Timeline';

// The career timeline, authored in React. A cross-framework visual-parity subject.
const meta: Meta<typeof Timeline> = {
	title: 'React/Timeline',
	component: Timeline,
	parameters: { layout: 'fullscreen' },
	decorators: [
		(Story) => (
			<MemoryRouter>
				<Story />
			</MemoryRouter>
		),
	],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

export const Default: Story = {};
