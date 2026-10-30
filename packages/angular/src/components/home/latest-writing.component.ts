import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { HomeContent, WritingTeaserItem } from '@fg/shared';

@Component({
	selector: 'app-latest-writing',
	standalone: true,
	imports: [RouterLink],
	styleUrl: '../../../../../styles/components/writing.module.css',
	template: `
		<section aria-labelledby="writing-title">
			<div class="container">
				<p class="section-label">{{ copy().label }}</p>
				<h2 class="section-title" id="writing-title">{{ copy().title }}</h2>
				<ul class="writing-grid">
					@for (post of writing(); track post.title) {
						<li>
							<a [routerLink]="post.href" class="writing-card" data-reveal>
							<span class="writing-tag">{{ post.tag }}</span>
							<h3 class="writing-title">{{ post.title }}</h3>
							<p class="writing-blurb">{{ post.blurb }}</p>
								<span class="writing-more">{{ copy().readMore }}</span>
							</a>
						</li>
					}
				</ul>
			</div>
		</section>
	`,
})
export class LatestWritingComponent {
	readonly writing = input.required<WritingTeaserItem[]>();
	readonly copy = input.required<HomeContent['sections']['writing']>();
}
