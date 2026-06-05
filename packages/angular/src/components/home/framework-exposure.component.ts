import { Component } from '@angular/core';
import type { FrameworkExposureSpan } from '@fg/shared';
import { axisTicks, ribbonRows, spansBounds } from '@fg/shared';
import backend from '../../../../content/backend-frameworks.json';
import frontend from '../../../../content/frontend-frameworks.json';
import { FrameworkRibbonComponent } from '../timeline/framework-ribbon.component';

const frontendFrameworks = frontend as FrameworkExposureSpan[];
const backendFrameworks = backend as FrameworkExposureSpan[];
// Both ribbons share one axis so their years line up.
const bounds = spansBounds(frontendFrameworks, backendFrameworks);

@Component({
	selector: 'app-framework-exposure',
	standalone: true,
	imports: [FrameworkRibbonComponent],
	styleUrls: ['../../../../../styles/components/framework-ribbon.module.css'],
	template: `
		<section>
			<div class="container">
				<p class="section-label">Frameworks</p>
				<h2 class="section-title head">Frameworks come and go. The craft compounds.</h2>
				<p class="intro">
					Twenty-five years on the web means living through every frontend era and the
					backends beneath it — and staying fluent while the stack reinvents itself.
				</p>
				<app-framework-ribbon title="Frontend Frameworks" [rows]="frontendRows" [ticks]="ticks" />
				<app-framework-ribbon title="Backend &amp; CMS" [rows]="backendRows" [ticks]="ticks" />
				<div class="ribbon-legend">
					@for (item of intensityLegend; track item.intensity) {
						<span class="legend-item">
							<span class="legend-swatch" [attr.data-intensity]="item.intensity"></span>
							{{ item.label }}
						</span>
					}
				</div>
			</div>
		</section>
	`,
})
export class FrameworkExposureComponent {
	protected readonly frontendRows = ribbonRows(frontendFrameworks, bounds);
	protected readonly backendRows = ribbonRows(backendFrameworks, bounds);
	protected readonly ticks = axisTicks(bounds);
	protected readonly intensityLegend = [
		{ intensity: 'professional', label: 'Professional / daily' },
		{ intensity: 'occasional', label: 'Occasional' },
		{ intensity: 'brief', label: 'Brief' },
	];
}
