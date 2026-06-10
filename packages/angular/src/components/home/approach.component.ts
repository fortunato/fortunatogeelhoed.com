import { Component, input } from '@angular/core';
import type { HomeContent, Principle } from '@fg/shared';

@Component({
	selector: 'app-approach',
	standalone: true,
	styleUrl: '../../../../../styles/components/approach.module.css',
	template: `
		<section data-band>
			<div class="container approach-body">
				<p class="section-label">{{ copy().label }}</p>
				<h2 class="section-title">{{ copy().title }}</h2>
				<div class="approach-grid">
					@for (principle of principles(); track principle.title) {
						<article class="principle" data-reveal>
							<h3 class="principle-title">{{ principle.title }}</h3>
							<p class="principle-desc">{{ principle.description }}</p>
						</article>
					}
				</div>
			</div>
		</section>
	`,
})
export class ApproachComponent {
	readonly principles = input.required<Principle[]>();
	readonly copy = input.required<HomeContent['sections']['approach']>();
}
