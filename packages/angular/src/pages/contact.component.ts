import { CUSTOM_ELEMENTS_SCHEMA, Component, inject } from '@angular/core';
import { ContactFormComponent } from '../components/contact-form.component';
import { ContentService } from '../content.service';

@Component({
	selector: 'app-contact',
	standalone: true,
	// The page reuses the shared contact-form composite; CUSTOM_ELEMENTS_SCHEMA allows the
	// <jb-tech-tag> custom elements around it.
	imports: [ContactFormComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	template: `
		<section>
			<div class="container">
				<span class="section-label">Available Now</span>
				<h1 class="section-title">{{ content?.title ?? "Let's work together." }}</h1>
				<p style="color: var(--jb-text-secondary)">{{ content?.body ?? 'Get in touch for consulting, freelance projects, or collaboration.' }}</p>

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

	content = this.contentService.getContent('contact');
}
