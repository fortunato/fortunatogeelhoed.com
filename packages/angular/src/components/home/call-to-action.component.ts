import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { HomeContent } from '@fg/shared';

@Component({
	selector: 'app-call-to-action',
	standalone: true,
	imports: [RouterLink],
	styleUrl: '../../../../../styles/components/cta.module.css',
	template: `
		<section class="cta">
			<div class="container">
				<div class="cta-panel">
					<h2 class="cta-heading" data-reveal>{{ cta().heading }}</h2>
					<a [routerLink]="cta().href" class="btn cta-btn">{{ cta().label }}</a>
				</div>
			</div>
		</section>
	`,
})
export class CallToActionComponent {
	readonly cta = input.required<HomeContent['cta']>();
}
