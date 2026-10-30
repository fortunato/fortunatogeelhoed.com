import { Component, input } from '@angular/core';
import type { AxisTick, RibbonRow } from '@fg/shared';

/** A single framework ribbon: a title, one labelled track per framework, and its own year
 *  axis (ticks come from the bounds shared across ribbons, so the axes line up). The legend
 *  is rendered once by the enclosing section. */
@Component({
	selector: 'app-framework-ribbon',
	standalone: true,
	styleUrls: ['../../../../../styles/components/framework-ribbon.module.css'],
	styles: [':host { display: block; }'],
	template: `
		<div class="ribbon">
			<p class="ribbon-title">{{ title() }}</p>
			<div class="ribbon-axis">
				@for (tick of ticks(); track tick.year) {
					<span class="ribbon-tick" [style.left.%]="tick.left">{{ tick.year }}</span>
				}
			</div>
			<ul class="ribbon-rows">
				@for (row of rows(); track row.framework) {
					<li class="ribbon-row">
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
					</li>
				}
			</ul>
		</div>
	`,
})
export class FrameworkRibbonComponent {
	readonly title = input.required<string>();
	readonly rows = input.required<RibbonRow[]>();
	readonly ticks = input.required<AxisTick[]>();
}
