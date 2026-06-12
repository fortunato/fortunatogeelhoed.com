import { articlePath } from '@fg/shared';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router';
import { Article } from './Article';

// A single article, authored in React. A cross-framework visual-parity subject: the same
// rendered article must look identical across React, Vue and Angular. Pins a fixed slug so the
// story is deterministic.
const SLUG = 'too-react';

const meta: Meta<typeof Article> = {
	title: 'React/Article',
	component: Article,
	parameters: { layout: 'fullscreen' },
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={[articlePath(SLUG)]}>
				<Routes>
					<Route path="/writing/:slug" element={<Story />} />
				</Routes>
			</MemoryRouter>
		),
	],
};

export default meta;
type Story = StoryObj<typeof Article>;

export const Default: Story = {};
