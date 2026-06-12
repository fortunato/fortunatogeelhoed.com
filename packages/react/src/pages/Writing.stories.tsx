import contentData from '@fg/content-data/data.json';
import type { ContentItem } from '@fg/shared';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import { ContentProvider } from '../content';
import { Writing } from './Writing';

// The writing index, authored in React. A cross-framework visual-parity subject: the same
// content and layout must render identically across React, Vue and Angular. Seeded with the real
// content so the heading and intro match the other two builds.
const content = contentData as Record<string, ContentItem>;

const meta: Meta<typeof Writing> = {
	title: 'React/Writing',
	component: Writing,
	parameters: { layout: 'fullscreen' },
	decorators: [
		(Story) => (
			<MemoryRouter>
				<ContentProvider content={content}>
					<Story />
				</ContentProvider>
			</MemoryRouter>
		),
	],
};

export default meta;
type Story = StoryObj<typeof Writing>;

export const Default: Story = {};
