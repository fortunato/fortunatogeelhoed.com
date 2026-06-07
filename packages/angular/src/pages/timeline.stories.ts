import { inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { formatTechQuery } from '@fg/shared';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { TechFilterService } from '../tech-filter.service';
import { TimelineComponent } from './timeline.component';

// The career timeline, authored as an Angular standalone component. A visual-parity subject. Each
// story bootstraps with an initializer that presets the filter deterministically (reset the root
// service + clear persistence + URL), so the active state does not depend on a prior render.
function presetFilters(tech: string[]) {
	return applicationConfig({
		providers: [
			provideRouter([]),
			provideAppInitializer(() => {
				if (typeof window !== 'undefined') {
					sessionStorage.removeItem('jb:timeline:tech');
					const q = formatTechQuery(new Set(tech));
					window.history.replaceState(
						null,
						'',
						window.location.pathname + (q ? `?tech=${q}` : ''),
					);
				}
				inject(TechFilterService).setActive(tech);
			}),
		],
	});
}

const meta: Meta<TimelineComponent> = {
	title: 'Angular/Timeline',
	component: TimelineComponent,
	parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<TimelineComponent>;

export const Default: Story = { decorators: [presetFilters([])] };

export const WithActiveFilters: Story = { decorators: [presetFilters(['React', 'Vue'])] };
