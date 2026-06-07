import {
	Component,
	type ElementRef,
	type OnDestroy,
	afterNextRender,
	computed,
	effect,
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
	entryMatchesTech,
	initTimelineMotion,
	readTechFilter,
	readTechFilterUrl,
	writeTechFilter,
	writeTechFilterUrl,
} from '@fg/shared';
import { FilterBarComponent } from '../components/timeline/filter-bar.component';
import { TimelineEntryComponent } from '../components/timeline/timeline-entry.component';
import { TechFilterService } from '../tech-filter.service';

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
	imports: [TimelineEntryComponent, FilterBarComponent],
	styleUrl: '../../../../styles/components/timeline.module.css',
	template: `
		<section class="page" #root>
			<div hidden [innerHTML]="sprite"></div>

			<div class="page-head">
				<p class="section-label">{{ page.label }}</p>
				<h1 class="section-title">{{ page.title }}</h1>
				<p class="intro">
					{{ page.intro }}
				</p>
			</div>

			<div class="timeline" [attr.data-filtering]="filtering() ? 'true' : null">
				<app-filter-bar [matchCount]="matchCount()" [total]="total" />

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
	private readonly filter = inject(TechFilterService);
	protected readonly sprite: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(TECH_SPRITE);
	protected readonly rows = buildRows(data);
	protected readonly page = page;
	protected readonly lanes = LANES;
	protected readonly laneLabels = LANE_LABELS;
	protected readonly total = data.entries.length;
	protected readonly filtering = computed(() => this.filter.active().size > 0);
	protected readonly matchCount = computed(
		() => data.entries.filter((e) => entryMatchesTech(e, this.filter.active())).length,
	);
	private syncedOnce = false;

	constructor() {
		afterNextRender(() => {
			initTimelineMotion(this.root().nativeElement);
		});

		// Seed after hydration so the first render matches the unfiltered prerender: the URL query
		// wins when present, else the persisted value seeds an otherwise-empty selection.
		afterNextRender(() => {
			const fromUrl = readTechFilterUrl();
			if (fromUrl.size) this.filter.setActive(fromUrl);
			else {
				const stored = readTechFilter();
				if (stored.size) this.filter.setActive(stored);
			}
		});

		// Mirror state -> URL via History.replaceState (a rewrite, not a navigation: no scroll, no
		// router) and sessionStorage, skipping the initial run so the seed above is not clobbered.
		effect(() => {
			const active = this.filter.active();
			if (!this.syncedOnce) {
				this.syncedOnce = true;
				return;
			}
			writeTechFilterUrl(active);
			writeTechFilter(active);
		});
	}

	ngOnDestroy(): void {
		destroyTimelineMotion();
	}
}
