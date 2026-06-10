import { Component, inject } from '@angular/core';
import { toParagraphs } from '@fg/shared';
import { ContentService } from '../content.service';

@Component({
	selector: 'app-services',
	standalone: true,
	template: `
		<section>
			<div class="container">
				<span class="section-label">What I Do</span>
				<h1 class="section-title">{{ content?.title ?? 'Services' }}</h1>
				<div
					style="max-width: 62ch; display: flex; flex-direction: column; gap: var(--jb-space-md); color: var(--jb-text-secondary); line-height: 1.7"
				>
					@for (paragraph of paragraphs; track paragraph) {
						<p>{{ paragraph }}</p>
					}
				</div>
			</div>
		</section>
	`,
})
export class ServicesComponent {
	private contentService = inject(ContentService);
	protected content = this.contentService.getContent('services');
	protected paragraphs = toParagraphs(this.content?.body ?? '');
}
