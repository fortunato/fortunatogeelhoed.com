import { Component, inject } from '@angular/core';
import { ContentService } from '../content.service';

@Component({
	selector: 'app-work',
	standalone: true,
	template: `
		<section>
			<div class="container">
				<span class="section-label">Selected Work</span>
				<h2 class="section-title">{{ content?.title ?? 'Case Studies' }}</h2>
				<p style="color: var(--jb-text-secondary)">{{ content?.body ?? 'Work page content will be loaded from the content pipeline.' }}</p>
			</div>
		</section>
	`,
})
export class WorkComponent {
	private contentService = inject(ContentService);
	content = this.contentService.getContent('work');
}
