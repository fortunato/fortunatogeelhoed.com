import { Component, input } from '@angular/core';
import type { EmploymentType, Lane, TimelineEntry } from '@fg/shared';
import { LANE_LABELS, techVisual } from '@fg/shared';

@Component({
	selector: 'app-timeline-entry',
	standalone: true,
	styleUrls: ['../../../../../styles/components/timeline.module.css'],
	// display:contents so the <article> participates directly in the parent .timeline grid.
	styles: [':host { display: contents; }'],
	template: `
		<article class="entry" [attr.data-type]="entry().type" data-reveal>
			<div class="spine">
				<div class="spine-years">{{ entry().years }}</div>
				<div class="spine-client">{{ entry().client }}</div>
				<div class="spine-role">{{ entry().role }}</div>
				<span class="spine-type" [attr.data-type]="entry().type">
					@if (entry().type === 'side-project') {
						<svg class="type-icon"><use href="#i-git" /></svg>
					}
					{{ typeLabel[entry().type] }}
				</span>
				@for (h of highlights(); track h) {
						<div class="spine-highlight">{{ h }}</div>
					}
			</div>

			@for (lane of lanes; track lane.key) {
				@if (entry().tech[lane.key]?.length) {
					<div class="lane {{ lane.cls }}" [attr.data-lane-label]="laneLabels[lane.key]">
						@for (t of entry().tech[lane.key] ?? []; track t) {
							<span class="pill" [style.--brand]="v(t).brand">
								@if (v(t).icon) {
									<svg class="pill-icon"><use [attr.href]="'#i-' + v(t).icon" /></svg>
								}
								{{ t }}
							</span>
						}
					</div>
				}
			}
		</article>
	`,
})
export class TimelineEntryComponent {
	readonly entry = input.required<TimelineEntry>();
	protected readonly laneLabels = LANE_LABELS;
	protected readonly v = techVisual;
	protected readonly lanes: { key: Lane; cls: string }[] = [
		{ key: 'frontend', cls: 'lane-fe' },
		{ key: 'backend', cls: 'lane-be' },
		{ key: 'cicd', cls: 'lane-ci' },
		{ key: 'ai', cls: 'lane-ai' },
	];
	protected readonly typeLabel: Record<EmploymentType, string> = {
		employee: 'Employee',
		independent: 'Independent',
		'side-project': 'Side project',
	};

	protected highlights(): string[] {
		const h = this.entry().highlight;
		return h ? (Array.isArray(h) ? h : [h]) : [];
	}
}
