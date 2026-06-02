import { Component, inject } from '@angular/core';
import { ContentService } from '../content.service';

@Component({
	selector: 'app-about',
	standalone: true,
	template: `
		<section>
			<div class="container">
				<span class="section-label">About</span>
				<h2 class="section-title">{{ content?.title ?? 'Fortunato Geelhoed' }}</h2>
				<p style="color: var(--jb-text-secondary)">{{ content?.body ?? 'About page content will be loaded from the content pipeline.' }}</p>
			</div>
		</section>
	`,
})
export class AboutComponent {
	private contentService = inject(ContentService);
	content = this.contentService.getContent('about');
}
