import {
	Component,
	type ElementRef,
	type OnDestroy,
	afterNextRender,
	input,
	viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type { HomeContent, ServiceOffering } from '@fg/shared';
import { initCardSpotlight } from '@fg/shared';
import { LinkDirective } from '../ui/link.directive';

@Component({
	selector: 'app-services',
	standalone: true,
	imports: [RouterLink, LinkDirective],
	styleUrl: '../../../../../styles/components/services.module.css',
	template: `
		<section aria-labelledby="services-title">
			<div class="container services-body">
				<p class="section-label">{{ copy().label }}</p>
				<h2 class="section-title" id="services-title">{{ copy().title }}</h2>
				<ul class="services-grid" #grid>
					@for (service of services(); track service.title; let i = $index) {
						<li class="service-card" data-reveal data-spotlight>
							<span class="service-index">{{ pad(i) }}</span>
							<h3 class="service-title">{{ service.title }}</h3>
							<p class="service-desc">{{ service.description }}</p>
						</li>
					}
				</ul>
				<a jbLink variant="arrow" [routerLink]="copy().link.href" class="services-link">{{ copy().link.label }}</a>
			</div>
		</section>
	`,
})
export class ServicesComponent implements OnDestroy {
	readonly services = input.required<ServiceOffering[]>();
	readonly copy = input.required<HomeContent['sections']['services']>();
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
