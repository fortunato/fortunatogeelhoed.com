import { formatTechQuery } from '@fg/shared';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { useTechFilter } from '../composables/useTechFilter';
import Timeline from './Timeline.vue';

// The career timeline, authored as a Vue SFC. A cross-framework visual-parity subject. Each story
// presets the filter deterministically (reset the module singleton + clear persistence + URL);
// parameters.tech lists the technologies to pre-activate.
function applyStoryFilter(tech: string[]) {
	if (typeof window !== 'undefined') {
		sessionStorage.removeItem('jb:timeline:tech');
		const q = formatTechQuery(new Set(tech));
		window.history.replaceState(null, '', window.location.pathname + (q ? `?tech=${q}` : ''));
	}
	useTechFilter().setActive(tech);
}

const meta: Meta<typeof Timeline> = {
	title: 'Vue/Timeline',
	component: Timeline,
	parameters: { layout: 'fullscreen', tech: [] },
	decorators: [
		(story, ctx) => {
			applyStoryFilter((ctx.parameters.tech as string[]) ?? []);
			return story();
		},
	],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

export const Default: Story = {};

export const WithActiveFilters: Story = { parameters: { tech: ['React', 'Vue'] } };
