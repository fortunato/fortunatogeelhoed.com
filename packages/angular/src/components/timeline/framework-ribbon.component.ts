import { Component, computed, input } from '@angular/core';
import type { TimelineData } from '@fg/shared';
import { axisTicks, ribbonRows } from '@fg/shared';

@Component({
	selector: 'app-framework-ribbon',
	standalone: true,
	styleUrls: ['../../../../../styles/components/timeline.module.css'],
	styles: [':host { display: block; }'],
	template: `
		<div class="ribbon container">
			<p class="ribbon-title">Framework exposure</p>
			@for (row of rows(); track row.framework) {
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
				@for (tick of ticks(); track tick.year) {
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
	`,
})
export class FrameworkRibbonComponent {
	readonly data = input.required<TimelineData>();
	protected readonly rows = computed(() => ribbonRows(this.data()));
	protected readonly ticks = computed(() => axisTicks(this.data()));
	protected readonly intensityLegend = [
		{ intensity: 'professional', label: 'Professional / daily' },
		{ intensity: 'occasional', label: 'Side-project' },
		{ intensity: 'brief', label: 'Brief' },
	];
}
