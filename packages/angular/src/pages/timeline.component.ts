import {
	Component,
	type ElementRef,
	type OnDestroy,
	afterNextRender,
	inject,
	viewChild,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import pageData from '@fg/content-data/timeline-page.json';
import timelineData from '@fg/content-data/timeline.json';
import type { TimelineData, TimelineEntry, TimelinePageCopy } from '@fg/shared';
import {
	LANES,
	LANE_LABELS,
	TECH_SPRITE,
	destroyTimelineMotion,
	initTimelineMotion,
} from '@fg/shared';
import { TimelineEntryComponent } from '../components/timeline/timeline-entry.component';

const data = timelineData as TimelineData;
const page = pageData as TimelinePageCopy;

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
	imports: [TimelineEntryComponent],
	styleUrl: '../../../../styles/components/timeline.module.css',
	template: `
		<section class="page" #root>
			<div hidden [innerHTML]="sprite"></div>

			<div class="container">
				<p class="section-label">{{ page.label }}</p>
				<h1 class="section-title">{{ page.title }}</h1>
				<p class="intro">
					{{ page.intro }}
				</p>
			</div>

			<div class="timeline">
				<div class="lane-headers" aria-hidden="true">
					<div class="lane-header"></div>
					@for (lane of lanes; track lane) {
						<div class="lane-header">{{ laneLabels[lane] }}</div>
					}
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
	protected readonly rows = buildRows(data);
	protected readonly page = page;
	protected readonly lanes = LANES;
	protected readonly laneLabels = LANE_LABELS;

	constructor() {
		afterNextRender(() => {
			initTimelineMotion(this.root().nativeElement);
		});
	}

	ngOnDestroy(): void {
		destroyTimelineMotion();
	}
}
