import { Component, input } from '@angular/core';
import type { ServiceOffering } from '@fg/shared';

@Component({
	selector: 'app-services',
	standalone: true,
	styleUrl: '../../../../../styles/components/home.module.css',
	template: `
		<section>
			<div class="container">
				<p class="section-label">What I do</p>
				<h2 class="section-title">Services</h2>
				<div class="services-grid">
					@for (service of services(); track service.title) {
						<article class="card" data-reveal>
							<h3 class="service-title">{{ service.title }}</h3>
							<p class="service-desc">{{ service.description }}</p>
						</article>
					}
				</div>
			</div>
		</section>
	`,
})
export class ServicesComponent {
	readonly services = input.required<ServiceOffering[]>();
}
