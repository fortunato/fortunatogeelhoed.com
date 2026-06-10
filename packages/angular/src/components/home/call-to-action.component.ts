import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { HomeContent } from '@fg/shared';
import { ButtonDirective } from '../ui/button.directive';

@Component({
	selector: 'app-call-to-action',
	standalone: true,
	imports: [RouterLink, ButtonDirective],
	styleUrl: '../../../../../styles/components/cta.module.css',
	template: `
		<section class="cta" aria-labelledby="cta-title">
			<div class="container">
				<div class="cta-panel">
					<h2 class="cta-heading" id="cta-title" data-reveal>{{ cta().heading }}</h2>
					<a jbButton variant="inverted" tone="marketing" [routerLink]="cta().href">{{ cta().label }}</a>
				</div>
			</div>
		</section>
	`,
})
export class CallToActionComponent {
	readonly cta = input.required<HomeContent['cta']>();
}
