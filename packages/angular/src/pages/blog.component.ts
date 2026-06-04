import { Component, inject } from '@angular/core';
import { ContentService } from '../content.service';

@Component({
	selector: 'app-blog',
	standalone: true,
	template: `
		<section>
			<div class="container">
				<span class="section-label">Writing</span>
				<h1 class="section-title">{{ content?.title ?? 'Blog' }}</h1>
				<p style="color: var(--jb-text-secondary)">{{ content?.body ?? 'Blog posts will be loaded from the content pipeline.' }}</p>
			</div>
		</section>
	`,
})
export class BlogComponent {
	private contentService = inject(ContentService);
	content = this.contentService.getContent('blog');
}
