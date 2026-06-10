import { Component, input } from '@angular/core';
import type { HomeContent, Principle } from '@fg/shared';

@Component({
	selector: 'app-approach',
	standalone: true,
	styleUrl: '../../../../../styles/components/approach.module.css',
	template: `
		<section data-band aria-labelledby="approach-title">
			<div class="container approach-body">
				<p class="section-label">{{ copy().label }}</p>
				<h2 class="section-title" id="approach-title">{{ copy().title }}</h2>
				<ul class="approach-grid">
					@for (principle of principles(); track principle.title) {
						<li class="principle" data-reveal>
							<h3 class="principle-title">{{ principle.title }}</h3>
							<p class="principle-desc">{{ principle.description }}</p>
						</li>
					}
				</ul>
			</div>
		</section>
	`,
})
export class ApproachComponent {
	readonly principles = input.required<Principle[]>();
	readonly copy = input.required<HomeContent['sections']['approach']>();
}
