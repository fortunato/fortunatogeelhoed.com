import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { HomeContent } from '@fg/shared';

@Component({
	selector: 'app-call-to-action',
	standalone: true,
	imports: [RouterLink],
	styleUrl: '../../../../../styles/components/home.module.css',
	template: `
		<section class="cta">
			<div class="container">
				<h2 class="cta-heading" data-reveal>{{ cta().heading }}</h2>
				<a [routerLink]="cta().href" class="btn">Get in touch</a>
			</div>
		</section>
	`,
})
export class CallToActionComponent {
	readonly cta = input.required<HomeContent['cta']>();
}
