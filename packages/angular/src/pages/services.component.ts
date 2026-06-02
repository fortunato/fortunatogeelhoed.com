import { Component, inject } from '@angular/core';
import { ContentService } from '../content.service';

@Component({
	selector: 'app-services',
	standalone: true,
	template: `
		<section>
			<div class="container">
				<span class="section-label">What I Do</span>
				<h2 class="section-title">{{ content?.title ?? 'Services' }}</h2>
				<p style="color: var(--text-secondary)">{{ content?.body ?? 'Services page content will be loaded from the content pipeline.' }}</p>
			</div>
		</section>
	`,
})
export class ServicesComponent {
	private contentService = inject(ContentService);
	content = this.contentService.getContent('services');
}
