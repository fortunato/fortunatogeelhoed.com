import { Component, computed, inject, input } from '@angular/core';
import { techVisual } from '@fg/shared';
import { TechFilterService } from '../../tech-filter.service';

// The filter bar: active tech filters as removable chips, a Clear-all, and a live result count.
// The bar element is always rendered (its height is reserved in CSS so toggling never shifts the
// layout); its contents appear only while a filter is active.
@Component({
	selector: 'app-filter-bar',
	standalone: true,
	styleUrls: ['../../../../../styles/components/timeline.module.css'],
	// display:contents so the bar participates directly in the parent .timeline flow.
	styles: [':host { display: contents; }'],
	template: `
		<div class="filter-bar" [attr.data-active]="activeList().length ? 'true' : null">
			@if (activeList().length) {
				<span class="filter-bar-label">Filtering by</span>
				@for (name of activeList(); track name) {
					<button
						type="button"
						class="filter-chip"
						[style.--brand]="v(name).brand"
						[attr.aria-label]="'Remove ' + name + ' filter'"
						(click)="filter.toggle(name)"
					>
						@if (v(name).icon) {
							<svg class="pill-icon" aria-hidden="true"><use [attr.href]="'#i-' + v(name).icon" /></svg>
						}
						{{ name }}
						<svg class="filter-chip-x" viewBox="0 0 16 16" aria-hidden="true">
							<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
						</svg>
					</button>
				}
				<button type="button" class="filter-clear" (click)="filter.clear()">Clear all</button>
			} @else {
				<span class="filter-hint">Select any technology to filter the timeline</span>
			}
			<!-- Always mounted so the first activation (0 → 1) is announced: screen readers often
			     skip a live region inserted at the same moment as its text. -->
			<p class="filter-count" aria-live="polite">
				{{ activeList().length ? matchCount() + ' of ' + total() + ' roles match' : '' }}
			</p>
		</div>
	`,
})
export class FilterBarComponent {
	readonly matchCount = input.required<number>();
	readonly total = input.required<number>();
	protected readonly filter = inject(TechFilterService);
	protected readonly v = techVisual;
	protected readonly activeList = computed(() => [...this.filter.active()]);
}
