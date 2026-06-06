import {
	Component,
	type ElementRef,
	type OnDestroy,
	afterNextRender,
	input,
	viewChild,
} from '@angular/core';
import type { ServiceOffering } from '@fg/shared';
import { initCardSpotlight } from '@fg/shared';

@Component({
	selector: 'app-services',
	standalone: true,
	styleUrl: '../../../../../styles/components/services.module.css',
	template: `
		<section>
			<div class="container services-body">
				<p class="section-label">What I do</p>
				<h2 class="section-title">Services</h2>
				<div class="services-grid" #grid>
					@for (service of services(); track service.title; let i = $index) {
						<article class="service-card" data-reveal data-spotlight>
							<span class="service-index">{{ pad(i) }}</span>
							<h3 class="service-title">{{ service.title }}</h3>
							<p class="service-desc">{{ service.description }}</p>
						</article>
					}
				</div>
			</div>
		</section>
	`,
})
export class ServicesComponent implements OnDestroy {
	readonly services = input.required<ServiceOffering[]>();
	private readonly grid = viewChild.required<ElementRef<HTMLElement>>('grid');
	private cleanup: () => void = () => {};

	constructor() {
		afterNextRender(() => {
			this.cleanup = initCardSpotlight(this.grid().nativeElement);
		});
	}

	protected pad(i: number): string {
		return String(i + 1).padStart(2, '0');
	}

	ngOnDestroy(): void {
		this.cleanup();
	}
}
