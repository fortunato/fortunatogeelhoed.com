import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { HomeContent, WritingTeaserItem } from '@fg/shared';

@Component({
	selector: 'app-latest-writing',
	standalone: true,
	imports: [RouterLink],
	styleUrl: '../../../../../styles/components/writing.module.css',
	template: `
		<section>
			<div class="container">
				<p class="section-label">{{ copy().label }}</p>
				<h2 class="section-title">{{ copy().title }}</h2>
				<div class="writing-grid">
					@for (post of writing(); track post.title) {
						<a [routerLink]="post.href" class="writing-card" data-reveal>
							<span class="writing-tag">{{ post.tag }}</span>
							<h3 class="writing-title">{{ post.title }}</h3>
							<p class="writing-blurb">{{ post.blurb }}</p>
							<span class="writing-more">{{ copy().readMore }}</span>
						</a>
					}
				</div>
			</div>
		</section>
	`,
})
export class LatestWritingComponent {
	readonly writing = input.required<WritingTeaserItem[]>();
	readonly copy = input.required<HomeContent['sections']['writing']>();
}
