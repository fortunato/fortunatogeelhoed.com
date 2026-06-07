import { CUSTOM_ELEMENTS_SCHEMA, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Lane, TimelineEntry } from '@fg/shared';
import {
	AGENCY_LABEL,
	EMPLOYMENT_TYPE_LABELS,
	LANE_LABELS,
	isExternalHref,
	techVisual,
} from '@fg/shared';

@Component({
	selector: 'app-timeline-entry',
	standalone: true,
	imports: [RouterLink],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	styleUrls: ['../../../../../styles/components/timeline.module.css'],
	// display:contents so the <article> participates directly in the parent .timeline grid.
	styles: [':host { display: contents; }'],
	template: `
		<article class="entry" [attr.data-type]="entry().type" data-reveal>
			<div class="spine">
				<div class="spine-years">{{ entry().years }}</div>
				<div class="spine-client">{{ entry().client }}</div>
				<div class="spine-role">{{ entry().role }}</div>
				<div class="spine-badges">
					<span class="spine-type" [attr.data-type]="entry().type">
						@if (entry().type === 'side-project') {
							<svg class="type-icon"><use href="#i-branch" /></svg>
						}
						{{ typeLabel[entry().type] }}
					</span>
					@if (entry().agency) {
						<span class="spine-agency">{{ agencyLabel }}</span>
					}
				</div>
				@if (entry().domains?.length) {
					<div class="spine-domains">
						@for (d of entry().domains ?? []; track d) {
							<span class="domain">{{ d }}</span>
						}
					</div>
				}
				@for (h of highlights(); track h) {
						<div class="spine-highlight">{{ h }}</div>
					}
				@if (entry().links?.length) {
					<div class="spine-links">
						@for (l of entry().links ?? []; track l.href) {
							@if (isExternal(l.href)) {
								<a
									[href]="l.href"
									class="spine-link spine-link-external"
									[attr.title]="l.title"
									[attr.aria-label]="(l.title ?? l.label) + ' (opens in a new tab)'"
									target="_blank"
									rel="noopener noreferrer"
								>
									@if (l.icon) {
										<jb-icon [attr.name]="l.icon"></jb-icon>
									}
									{{ l.label }}
								</a>
							} @else {
								<a [routerLink]="l.href" class="spine-link" [attr.title]="l.title">
									@if (l.icon) {
										<jb-icon [attr.name]="l.icon"></jb-icon>
									}
									{{ l.label }}
								</a>
							}
						}
					</div>
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
	protected readonly typeLabel = EMPLOYMENT_TYPE_LABELS;
	protected readonly agencyLabel = AGENCY_LABEL;
	protected readonly isExternal = isExternalHref;

	protected highlights(): string[] {
		const h = this.entry().highlight;
		return h ? (Array.isArray(h) ? h : [h]) : [];
	}
}
