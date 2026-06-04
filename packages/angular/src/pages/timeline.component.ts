import {
	Component,
	type ElementRef,
	type OnDestroy,
	afterNextRender,
	inject,
	viewChild,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import type { TimelineData, TimelineEntry } from '@fg/shared';
import { TECH_SPRITE, destroyTimelineMotion, initTimelineMotion } from '@fg/shared';
import timelineData from '../../../content/timeline.json';
import { FrameworkRibbonComponent } from '../components/timeline/framework-ribbon.component';
import { TimelineEntryComponent } from '../components/timeline/timeline-entry.component';

const data = timelineData as TimelineData;

type Row =
	| { kind: 'era'; era: string; key: string }
	| { kind: 'entry'; entry: TimelineEntry; key: string };

function buildRows(d: TimelineData): Row[] {
	const out: Row[] = [];
	let last = '';
	for (const entry of d.entries) {
		if (entry.era !== last) {
			out.push({ kind: 'era', era: entry.era, key: `era-${entry.era}` });
			last = entry.era;
		}
		out.push({ kind: 'entry', entry, key: entry.id });
	}
	return out;
}

@Component({
	selector: 'app-timeline',
	standalone: true,
	imports: [FrameworkRibbonComponent, TimelineEntryComponent],
	styleUrl: '../../../../styles/components/timeline.module.css',
	template: `
		<section class="page" #root>
			<div hidden [innerHTML]="sprite"></div>

			<div class="container">
				<p class="section-label">Career</p>
				<h1 class="section-title">Twenty-five years across the stack</h1>
				<p class="intro">
					From classic ASP and Flash to React, NestJS and agentic workflows — a working life
					across the frontend, backend, infrastructure and, lately, AI. Frameworks deepen, the
					AI lane fills in, and side projects branch off the spine.
				</p>
			</div>

			<app-framework-ribbon [data]="data" />

			<div class="timeline">
				<div class="lane-headers" aria-hidden="true">
					<div class="lane-header"></div>
					<div class="lane-header">Frontend</div>
					<div class="lane-header">Backend / DB</div>
					<div class="lane-header">CI/CD &amp; Infra</div>
					<div class="lane-header">AI / LLM</div>
				</div>

				@for (row of rows; track row.key) {
					@if (row.kind === 'era') {
						<div class="era" data-reveal><span class="era-label">{{ row.era }}</span></div>
					} @else {
						<app-timeline-entry [entry]="row.entry" />
					}
				}
			</div>
		</section>
	`,
})
export class TimelineComponent implements OnDestroy {
	private readonly sanitizer = inject(DomSanitizer);
	private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
	protected readonly sprite: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(TECH_SPRITE);
	protected readonly data = data;
	protected readonly rows = buildRows(data);

	constructor() {
		afterNextRender(() => {
			initTimelineMotion(this.root().nativeElement);
		});
	}

	ngOnDestroy(): void {
		destroyTimelineMotion();
	}
}
