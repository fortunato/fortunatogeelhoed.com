import { CUSTOM_ELEMENTS_SCHEMA, Component, computed, inject } from '@angular/core';
import { availabilityBadge, availabilityBookedLine } from '@fg/shared';
import { AvailabilityService } from '../availability.service';
import { ContactFormComponent } from '../components/contact-form.component';
import { ContentService } from '../content.service';

@Component({
	selector: 'app-contact',
	standalone: true,
	// The page reuses the shared contact-form composite; CUSTOM_ELEMENTS_SCHEMA allows the
	// <jb-tech-tag> custom elements around it.
	imports: [ContactFormComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	// Skip hydration for this page: the badge/sub-line are rewritten server-side to the live
	// availability and re-rendered client-side from the same seeded value, so skipping avoids
	// a structural hydration mismatch while producing no visible change.
	host: { ngSkipHydration: 'true' },
	template: `
		<section>
			<div class="container">
				<span class="section-label" data-availability-badge [attr.data-state]="availability().available ? 'available' : 'booked'">{{ badge() }}</span>
				<h1 class="section-title">{{ content?.title ?? "Let's work together." }}</h1>
				<p data-availability-line style="color: var(--jb-text-secondary)">{{ body() }}</p>

				<app-contact-form></app-contact-form>

				<p class="contact-meta">
					<jb-tech-tag>Angular</jb-tech-tag>
					<jb-tech-tag>TypeScript</jb-tech-tag>
					<jb-tech-tag>Vite</jb-tech-tag>
				</p>
			</div>
		</section>
	`,
})
export class ContactComponent {
	private contentService = inject(ContentService);
	private availabilityService = inject(AvailabilityService);

	content = this.contentService.getContent('contact');
	availability = this.availabilityService.availability;

	badge = computed(() => availabilityBadge(this.availability()));

	// Regular copy when available; the adapted sub-line when booked.
	body = computed(() =>
		this.availability().available
			? (this.content?.body ??
				'Get in touch for consulting, freelance projects, or collaboration.')
			: availabilityBookedLine(this.availability()),
	);
}
