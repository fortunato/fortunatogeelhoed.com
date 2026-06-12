import { DOCUMENT } from '@angular/common';
import { Component, ViewEncapsulation, inject } from '@angular/core';
import { DomSanitizer, Meta, type SafeHtml, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import postsData from '@fg/content-data/posts.json';
import { type Article, SITE_NAME, SITE_URL, WRITING_BASE, articlePath } from '@fg/shared';

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

@Component({
	selector: 'app-article',
	standalone: true,
	imports: [RouterLink],
	styleUrl: '../../../../styles/components/prose.module.css',
	// The article body is injected as trusted HTML, so it carries no _ngcontent attribute and
	// emulated encapsulation would never reach it. Disable encapsulation: every prose rule is
	// scoped under .prose, so the styles only ever apply to the article body.
	encapsulation: ViewEncapsulation.None,
	template: `
		<section>
			<div class="container">
				@if (article) {
					<p class="section-label">{{ article.tag }}</p>
					<h1 class="section-title">{{ article.title }}</h1>
					<p class="writing-tag" style="display: block; margin-bottom: var(--jb-space-lg)">
						{{ date }} · {{ article.tag }} · {{ article.readingMinutes }} min read
					</p>

					<!-- Trusted, build-rendered article HTML. -->
					<div class="prose" [innerHTML]="body"></div>

					<p style="margin-top: var(--jb-space-xl)">
						<a [routerLink]="writingBase" class="link link--arrow">Back to writing</a>
					</p>
				} @else {
					<h1 class="section-title">Not found</h1>
					<p style="color: var(--jb-text-secondary)">That article does not exist.</p>
					<a [routerLink]="writingBase" class="link link--arrow">Back to writing</a>
				}
			</div>
		</section>
	`,
})
export class ArticleComponent {
	private readonly route = inject(ActivatedRoute);
	private readonly sanitizer = inject(DomSanitizer);
	private readonly title = inject(Title);
	private readonly meta = inject(Meta);
	private readonly document = inject(DOCUMENT);
	protected readonly writingBase = WRITING_BASE;
	protected readonly article = published.find(
		(post) => post.slug === this.route.snapshot.paramMap.get('slug'),
	);
	protected readonly date = this.article ? formatDate(this.article.date) : '';
	protected readonly body: SafeHtml | null = this.article
		? this.sanitizer.bypassSecurityTrustHtml(this.article.html)
		: null;

	constructor() {
		// Per-article head for the Angular render: title, meta description, and canonical at
		// minimum, plus the Open Graph article tags so a shared link unfurls correctly. The
		// canonical always points at the single indexed URL, regardless of the rendering framework.
		const a = this.article;
		if (!a) {
			this.title.setTitle(`Not found | ${SITE_NAME}`);
			return;
		}
		const canonical = `${SITE_URL}${articlePath(a.slug)}`;
		const image = `${SITE_URL}${a.ogImage}`;
		const description = a.description ?? '';
		this.title.setTitle(a.title);
		this.meta.updateTag({ name: 'description', content: description });
		this.meta.updateTag({ property: 'og:type', content: 'article' });
		this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
		this.meta.updateTag({ property: 'og:title', content: a.title });
		this.meta.updateTag({ property: 'og:description', content: description });
		this.meta.updateTag({ property: 'og:url', content: canonical });
		this.meta.updateTag({ property: 'og:image', content: image });
		this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
		this.meta.updateTag({ name: 'twitter:title', content: a.title });
		this.meta.updateTag({ name: 'twitter:description', content: description });
		this.meta.updateTag({ name: 'twitter:image', content: image });

		// Meta only manages <meta>; the canonical is a <link>, so reconcile it directly.
		const head = this.document.head;
		let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
		if (!link) {
			link = this.document.createElement('link');
			link.setAttribute('rel', 'canonical');
			head.appendChild(link);
		}
		link.setAttribute('href', canonical);
	}
}
