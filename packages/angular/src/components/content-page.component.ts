import { Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import type { ContentItem } from '@fg/shared';

// A long-form content page (Services, Privacy): a section label and title, then the page's
// build-rendered markdown HTML under the shared prose styles. The same component backs every
// such page so headings, lists, and in-content links render identically across the frameworks.
@Component({
	selector: 'app-content-page',
	standalone: true,
	styleUrl: '../../../../styles/components/prose.module.css',
	// The page body is injected as trusted HTML, so it carries no _ngcontent attribute and
	// emulated encapsulation would never reach it. Disable encapsulation: every prose rule is
	// scoped under .prose, so the styles only ever apply to the injected body. Mirrors the article.
	encapsulation: ViewEncapsulation.None,
	template: `
		<section>
			<div class="container">
				<span class="section-label">{{ label() }}</span>
				<h1 class="section-title">{{ content()?.title ?? '' }}</h1>
				<!-- Trusted, build-rendered page HTML. -->
				<div class="prose" [innerHTML]="body()"></div>
			</div>
		</section>
	`,
})
export class ContentPageComponent {
	private readonly sanitizer = inject(DomSanitizer);
	readonly label = input.required<string>();
	readonly content = input.required<ContentItem | null>();
	protected readonly body = computed<SafeHtml>(() =>
		this.sanitizer.bypassSecurityTrustHtml(this.content()?.html ?? ''),
	);
}
