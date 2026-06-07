import { formatTechQuery } from '@fg/shared';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import { TechFilterProvider } from '../hooks/useTechFilter';
import { Timeline } from './Timeline';

// The career timeline, authored in React. A cross-framework visual-parity subject. Each story
// presets the filter through the real seed path (URL query + cleared persistence) so the active
// state is deterministic; parameters.tech lists the technologies to pre-activate.
function applyStoryFilter(tech: string[]) {
	if (typeof window === 'undefined') return;
	sessionStorage.removeItem('jb:timeline:tech');
	const q = formatTechQuery(new Set(tech));
	window.history.replaceState(null, '', window.location.pathname + (q ? `?tech=${q}` : ''));
}

const meta: Meta<typeof Timeline> = {
	title: 'React/Timeline',
	component: Timeline,
	parameters: { layout: 'fullscreen', tech: [] },
	decorators: [
		(Story, ctx) => {
			applyStoryFilter((ctx.parameters.tech as string[]) ?? []);
			return (
				<MemoryRouter>
					<TechFilterProvider>
						<Story />
					</TechFilterProvider>
				</MemoryRouter>
			);
		},
	],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

export const Default: Story = {};

export const WithActiveFilters: Story = { parameters: { tech: ['React', 'Vue'] } };
