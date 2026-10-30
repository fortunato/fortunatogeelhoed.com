import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import postsData from '@fg/content-data/posts.json';
import { type Article, articlePath } from '@fg/shared';
import { ContentService } from '../content.service';

const published = (postsData as { published: Article[] }).published;

// Render an ISO date (YYYY-MM-DD) as a long, readable form. Fixed locale and UTC so the
// prerendered output is deterministic and identical across the three framework builds.
function formatDate(iso: string | undefined): string {
	if (!iso) return '';
	const date = new Date(`${iso}T00:00:00Z`);
	return new Intl.DateTimeFormat('en-GB', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	}).format(date);
}

interface WritingCard extends Article {
	href: string;
	formattedDate: string;
}

@Component({
	selector: 'app-writing',
	standalone: true,
	imports: [RouterLink],
	styleUrl: '../../../../styles/components/writing.module.css',
	template: `
		<section>
			<div class="container">
				<span class="section-label">Writing</span>
				<h1 class="section-title">{{ content?.title ?? 'Writing' }}</h1>
				@if (content?.description) {
					<p style="color: var(--jb-text-secondary); max-width: 62ch">
						{{ content?.description }}
					</p>
				}
				<ul class="writing-grid">
					@for (post of posts; track post.slug) {
						<li>
							<a [routerLink]="post.href" class="writing-card" data-reveal>
								<span class="writing-tag">{{ post.tag }}</span>
								<h2 class="writing-title">{{ post.title }}</h2>
								<p class="writing-blurb">{{ post.description }}</p>
								<span class="writing-meta">
									{{ post.formattedDate }} · {{ post.readingMinutes }} min read
								</span>
								<span class="writing-more">Read more</span>
							</a>
						</li>
					}
				</ul>
			</div>
		</section>
	`,
})
export class WritingComponent {
	private contentService = inject(ContentService);
	protected content = this.contentService.getContent('writing');
	protected posts: WritingCard[] = published.map((post) => ({
		...post,
		href: articlePath(post.slug),
		formattedDate: formatDate(post.date),
	}));
}
