import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import backend from '@fg/content-data/backend-frameworks.json';
import frontend from '@fg/content-data/frontend-frameworks.json';
import type { FrameworkExposureSpan, HomeContent } from '@fg/shared';
import { INTENSITY_LEGEND, axisTicks, ribbonRows, spansBounds } from '@fg/shared';
import { FrameworkRibbonComponent } from '../timeline/framework-ribbon.component';
import { LinkDirective } from '../ui/link.directive';

const frontendFrameworks = frontend as FrameworkExposureSpan[];
const backendFrameworks = backend as FrameworkExposureSpan[];
// Both ribbons share one axis so their years line up.
const bounds = spansBounds(frontendFrameworks, backendFrameworks);

@Component({
	selector: 'app-framework-exposure',
	standalone: true,
	imports: [FrameworkRibbonComponent, RouterLink, LinkDirective],
	styleUrls: ['../../../../../styles/components/framework-ribbon.module.css'],
	template: `
		<section>
			<div class="container exposure-body">
				<p class="section-label">{{ copy().label }}</p>
				<h2 class="section-title head">{{ copy().title }}</h2>
				<p class="intro">{{ copy().intro }}</p>
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
				<a jbLink variant="arrow" [routerLink]="copy().link.href" class="exposure-link">{{ copy().link.label }}</a>
			</div>
		</section>
	`,
})
export class FrameworkExposureComponent {
	readonly copy = input.required<HomeContent['sections']['frameworks']>();
	protected readonly frontendRows = ribbonRows(frontendFrameworks, bounds);
	protected readonly backendRows = ribbonRows(backendFrameworks, bounds);
	protected readonly ticks = axisTicks(bounds);
	protected readonly intensityLegend = INTENSITY_LEGEND;
}
