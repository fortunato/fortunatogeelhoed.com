import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import { Header } from './Header';

// The site header (and primary nav), authored in React. A framework-authored composite that
// consumes jb-theme-toggle. Shown for completeness; it is deliberately NOT a visual-parity
// subject because the active framework-switcher button differs per section by design.
const meta: Meta<typeof Header> = {
	title: 'React/Header',
	component: Header,
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
type Story = StoryObj<typeof Header>;

export const Default: Story = {};
