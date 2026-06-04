import { Component, type OnDestroy, afterNextRender } from '@angular/core';
import type { TimelineData } from '@fg/shared';
import { destroySmoothScroll, initSmoothScroll } from '@fg/shared';
import timelineData from '../../../content/timeline.json';
import { FrameworkRibbonComponent } from '../components/timeline/framework-ribbon.component';
import { TimelineEntryComponent } from '../components/timeline/timeline-entry.component';

const data = timelineData as TimelineData;

@Component({
	selector: 'app-timeline',
	standalone: true,
	imports: [FrameworkRibbonComponent, TimelineEntryComponent],
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

			<app-framework-ribbon [data]="data" />

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
					<app-timeline-entry [entry]="entry" />
				}
			</div>
		</section>
	`,
})
export class TimelineComponent implements OnDestroy {
	constructor() {
		afterNextRender(() => {
			initSmoothScroll();
		});
	}

	ngOnDestroy(): void {
		destroySmoothScroll();
	}

	protected readonly data = data;
}
