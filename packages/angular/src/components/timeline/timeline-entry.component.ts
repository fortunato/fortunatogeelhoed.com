import { Component, input } from '@angular/core';
import type { Lane, TimelineEntry } from '@fg/shared';
import { LANE_LABELS } from '@fg/shared';

@Component({
	selector: 'app-timeline-entry',
	standalone: true,
	styleUrls: ['../../../../../styles/components/timeline.module.css'],
	// The host element must not generate a box, so the <article> participates directly in
	// the parent .timeline grid (otherwise the lane columns would not line up).
	styles: [':host { display: contents; }'],
	template: `
		<article class="entry" [attr.data-side]="entry().isSideProject ? 'true' : null" data-reveal>
			@for (lane of leftLanes; track lane.key) {
				@if (entry().tech[lane.key]?.length) {
					<div class="lane {{ lane.cls }}" [attr.data-lane-label]="laneLabels[lane.key]">
						@for (t of entry().tech[lane.key] ?? []; track t) {
							<span class="tech-tag">{{ t }}</span>
						}
					</div>
				}
			}

			<div class="spine">
				<span class="year-node" [attr.data-emp]="entry().employmentType">
					{{ entry().startYear }}
				</span>
			</div>

			<div class="role">
				<p class="role-period">{{ period(entry()) }}</p>
				<p class="role-title">{{ entry().role }}</p>
				<p class="role-org">{{ entry().organization }}</p>
				@if (entry().summary) {
					<p class="role-summary">{{ entry().summary }}</p>
				}
				@if (entry().isSideProject) {
					<span class="role-badge">Side project</span>
				}
			</div>

			@if (entry().tech.frontend?.length) {
				<div class="lane lane-fe" data-lane-label="Frontend">
					@for (t of entry().tech.frontend ?? []; track t) {
						<span class="tech-tag">{{ t }}</span>
					}
				</div>
			}
		</article>
	`,
})
export class TimelineEntryComponent {
	readonly entry = input.required<TimelineEntry>();
	protected readonly laneLabels = LANE_LABELS;
	protected readonly leftLanes: { key: Lane; cls: string }[] = [
		{ key: 'ai-llm', cls: 'lane-ai' },
		{ key: 'ci-cd', cls: 'lane-cicd' },
		{ key: 'database', cls: 'lane-db' },
		{ key: 'backend', cls: 'lane-be' },
	];

	protected period(entry: TimelineEntry): string {
		if (entry.endYear === 'present') return `${entry.startYear}–now`;
		return entry.endYear === entry.startYear
			? `${entry.startYear}`
			: `${entry.startYear}–${entry.endYear}`;
	}
}
