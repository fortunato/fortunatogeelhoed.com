import { CUSTOM_ELEMENTS_SCHEMA, Component, ViewEncapsulation, inject } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { GITHUB_REPO_URL, LINKEDIN_URL } from '@fg/shared';
import { ButtonDirective } from '../components/ui/button.directive';
import { ContentService } from '../content.service';

@Component({
	selector: 'app-about',
	standalone: true,
	imports: [RouterLink, ButtonDirective],
	// Allow the <jb-icon> custom element in this template.
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	styleUrl: '../../../../styles/components/about.module.css',
	// The bio is injected as trusted HTML, so it carries no _ngcontent attribute and emulated
	// encapsulation would never reach it. Disable encapsulation: every rule is scoped under an
	// .about* class, so the styles only ever apply to this page. Mirrors the content page.
	encapsulation: ViewEncapsulation.None,
	template: `
		<section class="about">
			<article class="about-inner container">
				<div class="about-prose">
					<span class="section-label">About</span>
					<h1 class="section-title">Fortunato Geelhoed</h1>
					<div class="about-photo">
						<img
							src="/assets/images/fortunato.webp"
							[alt]="photoAlt"
							width="872"
							height="594"
							decoding="async"
						/>
					</div>
					<!-- Trusted, build-rendered page HTML: the bio prose with its in-content links. -->
					<div class="about-body" [innerHTML]="body"></div>
					<div class="about-cta">
						<a jbButton routerLink="/career">View the career timeline</a>
						<a
							jbButton
							variant="secondary"
							[href]="githubRepoUrl"
							target="_blank"
							rel="noopener noreferrer"
						>
							<jb-icon name="github"></jb-icon>
							View the source
						</a>
						<a
							jbButton
							variant="secondary"
							[href]="linkedinUrl"
							target="_blank"
							rel="noopener noreferrer"
						>
							<jb-icon name="linkedin"></jb-icon>
							LinkedIn
						</a>
					</div>
				</div>
			</article>
		</section>
	`,
})
export class AboutComponent {
	private contentService = inject(ContentService);
	private sanitizer = inject(DomSanitizer);
	protected readonly body: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
		this.contentService.getContent('about')?.html ?? '',
	);
	protected readonly photoAlt =
		'Fortunato Geelhoed, freelance full-stack TypeScript engineer based on the Costa Blanca, Spain';
	protected readonly githubRepoUrl = GITHUB_REPO_URL;
	protected readonly linkedinUrl = LINKEDIN_URL;
}
