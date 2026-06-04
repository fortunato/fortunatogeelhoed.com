import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { WritingTeaserItem } from '@fg/shared';

@Component({
	selector: 'app-latest-writing',
	standalone: true,
	imports: [RouterLink],
	styleUrl: '../../../../../styles/components/home.module.css',
	template: `
		<section>
			<div class="container">
				<p class="section-label">Latest writing</p>
				<h2 class="section-title">From the blog</h2>
				<div class="writing-grid">
					@for (post of writing(); track post.title) {
						<a [routerLink]="post.href" class="card writing-card" data-reveal>
							<h3 class="writing-title">{{ post.title }}</h3>
							<p class="writing-blurb">{{ post.blurb }}</p>
							<span class="writing-more">Read more →</span>
						</a>
					}
				</div>
			</div>
		</section>
	`,
})
export class LatestWritingComponent {
	readonly writing = input.required<WritingTeaserItem[]>();
}
