import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import { Home } from './Home';

// The homepage, authored in React. A cross-framework visual-parity subject: the same
// content and layout must render identically across React, Vue and Angular.
const meta: Meta<typeof Home> = {
	title: 'React/Home',
	component: Home,
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
type Story = StoryObj<typeof Home>;

export const Default: Story = {};
