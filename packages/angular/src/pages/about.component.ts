import { CUSTOM_ELEMENTS_SCHEMA, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GITHUB_REPO_URL, LINKEDIN_URL, toParagraphs } from '@fg/shared';
import { ButtonDirective } from '../components/ui/button.directive';
import { ContentService } from '../content.service';

@Component({
	selector: 'app-about',
	standalone: true,
	imports: [RouterLink, ButtonDirective],
	// Allow the <jb-icon> custom element in this template.
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	styleUrl: '../../../../styles/components/about.module.css',
	template: `
		<section class="about">
			<article class="about-inner container">
				<figure class="about-photo">
					<img
						src="/assets/images/fortunato.webp"
						[alt]="photoAlt"
						width="480"
						height="600"
						decoding="async"
					/>
				</figure>
				<div class="about-prose">
					<span class="section-label">About</span>
					<h1 class="section-title">Fortunato Geelhoed</h1>
					@for (paragraph of paragraphs; track paragraph; let first = $first) {
						<p [class.about-lead]="first">{{ paragraph }}</p>
					}
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
	protected readonly paragraphs = toParagraphs(
		this.contentService.getContent('about')?.body ?? '',
	);
	protected readonly photoAlt =
		'Fortunato Geelhoed, freelance full-stack TypeScript engineer based on the Costa Blanca, Spain';
	protected readonly githubRepoUrl = GITHUB_REPO_URL;
	protected readonly linkedinUrl = LINKEDIN_URL;
}
