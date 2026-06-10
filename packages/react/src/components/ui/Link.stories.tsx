import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import { TextLink } from './Link';

// Text-first link, rendered in React's accent. `inline` for prose; `arrow` for the "read more"
// / "see the timeline" affordance (CSS-drawn chevron nudges on hover).
const meta: Meta<typeof TextLink> = {
	title: 'React/Foundations/Link',
	component: TextLink,
	parameters: { layout: 'centered' },
	decorators: [
		(Story) => (
			<MemoryRouter>
				<Story />
			</MemoryRouter>
		),
	],
	argTypes: {
		variant: { control: 'inline-radio', options: ['inline', 'arrow'] },
	},
	args: { variant: 'inline', to: '/blog', children: 'Read the article' },
};

export default meta;
type Story = StoryObj<typeof TextLink>;

export const Inline: Story = {};

export const Arrow: Story = { args: { variant: 'arrow', children: 'See the full timeline' } };
