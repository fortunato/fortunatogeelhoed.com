import { Component } from '@angular/core';
import type { Lane, TimelineData, TimelineEntry } from '@fg/shared';
import { LANE_LABELS, axisTicks, ribbonRows } from '@fg/shared';
import timelineData from '../../../content/timeline.json';

const data = timelineData as TimelineData;

@Component({
	selector: 'app-timeline',
	standalone: true,
	styleUrl: '../../../../styles/components/timeline.module.css',
	template: `
		<section class="page">
			<div class="container">
				<p class="section-label">Career</p>
				<h1 class="section-title">Twenty-five years, five lanes</h1>
				<p class="intro">
					From classic ASP and Flash to React, NestJS and agentic workflows — a working life
					across the frontend, backend, infrastructure and, lately, AI. Frameworks deepen, the
					AI lane fills in, and a trading system runs quietly alongside it all.
				</p>
			</div>

			<div class="ribbon container">
				<p class="ribbon-title">Framework exposure</p>
				@for (row of rows; track row.framework) {
					<div class="ribbon-row">
						<span class="ribbon-label">{{ row.framework }}</span>
						<div class="ribbon-track">
							@for (seg of row.segments; track $index) {
								<span
									class="ribbon-seg"
									[attr.data-intensity]="seg.intensity"
									[style.left.%]="seg.left"
									[style.width.%]="seg.intensity !== 'brief' ? seg.width : null"
								></span>
							}
						</div>
					</div>
				}
				<div class="ribbon-axis">
					@for (tick of ticks; track tick.year) {
						<span class="ribbon-tick" [style.left.%]="tick.left">{{ tick.year }}</span>
					}
				</div>
				<div class="ribbon-legend">
					@for (item of intensityLegend; track item.intensity) {
						<span class="legend-item">
							<span class="legend-swatch" [attr.data-intensity]="item.intensity"></span>
							{{ item.label }}
						</span>
					}
				</div>
			</div>

			<div class="timeline">
				<div class="lane-labels" aria-hidden="true">
					<span class="lane-head" data-side="left">AI / LLM</span>
					<span class="lane-head" data-side="left">CI / CD</span>
					<span class="lane-head" data-side="left">Database</span>
					<span class="lane-head" data-side="left">Backend</span>
					<span class="lane-head">Year</span>
					<span class="lane-head">Role</span>
					<span class="lane-head">Frontend</span>
				</div>

				@for (entry of data.entries; track entry.id) {
					<article
						class="entry"
						[attr.data-side]="entry.isSideProject ? 'true' : null"
						data-reveal
					>
						@for (lane of leftLanes; track lane.key) {
							@if (entry.tech[lane.key]?.length) {
								<div class="lane {{ lane.cls }}" [attr.data-lane-label]="laneLabels[lane.key]">
									@for (t of entry.tech[lane.key] ?? []; track t) {
										<span class="tech-tag">{{ t }}</span>
									}
								</div>
							}
						}

						<div class="spine">
							<span class="year-node" [attr.data-emp]="entry.employmentType">
								{{ entry.startYear }}
							</span>
						</div>

						<div class="role">
							<p class="role-period">{{ period(entry) }}</p>
							<p class="role-title">{{ entry.role }}</p>
							<p class="role-org">{{ entry.organization }}</p>
							@if (entry.summary) {
								<p class="role-summary">{{ entry.summary }}</p>
							}
							@if (entry.isSideProject) {
								<span class="role-badge">Side project</span>
							}
						</div>

						@if (entry.tech.frontend?.length) {
							<div class="lane lane-fe" data-lane-label="Frontend">
								@for (t of entry.tech.frontend ?? []; track t) {
									<span class="tech-tag">{{ t }}</span>
								}
							</div>
						}
					</article>
				}
			</div>
		</section>
	`,
})
export class TimelineComponent {
	protected readonly data = data;
	protected readonly rows = ribbonRows(data);
	protected readonly ticks = axisTicks(data);
	protected readonly laneLabels = LANE_LABELS;
	protected readonly leftLanes: { key: Lane; cls: string }[] = [
		{ key: 'ai-llm', cls: 'lane-ai' },
		{ key: 'ci-cd', cls: 'lane-cicd' },
		{ key: 'database', cls: 'lane-db' },
		{ key: 'backend', cls: 'lane-be' },
	];
	protected readonly intensityLegend = [
		{ intensity: 'professional', label: 'Professional / daily' },
		{ intensity: 'occasional', label: 'Side-project' },
		{ intensity: 'brief', label: 'Brief' },
	];

	protected period(entry: TimelineEntry): string {
		if (entry.endYear === 'present') return `${entry.startYear}–now`;
		return entry.endYear === entry.startYear
			? `${entry.startYear}`
			: `${entry.startYear}–${entry.endYear}`;
	}
}
