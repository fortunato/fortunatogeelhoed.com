import { Component, inject } from '@angular/core';
import { ContentService } from '../content.service';

@Component({
	selector: 'app-contact',
	standalone: true,
	template: `
		<section>
			<div class="container">
				<span class="section-label">Available Now</span>
				<h2 class="section-title">{{ content?.title ?? "Let's work together." }}</h2>
				<p style="color: var(--text-secondary)">{{ content?.body ?? 'Get in touch for consulting, freelance projects, or collaboration.' }}</p>
			</div>
		</section>
	`,
})
export class ContactComponent {
	private contentService = inject(ContentService);
	content = this.contentService.getContent('contact');
}
