import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-footer',
	standalone: true,
	imports: [RouterLink],
	// Allow the <jb-icon> custom element in this template.
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	styleUrl: '../../../../styles/components/footer.module.css',
	template: `
		<footer class="footer">
			<div class="footer-inner container">
				<span class="footer-brand">
					FORTUNATO<span class="footer-dot">.</span>GEELHOED
				</span>
				<nav class="footer-links" aria-label="Social and external links">
					<a
						href="https://www.linkedin.com/in/fortunatogeelhoed/"
						target="_blank"
						rel="noopener noreferrer"
					>
						<jb-icon name="linkedin"></jb-icon>
						LinkedIn
					</a>
					<a href="https://github.com/fortunato" target="_blank" rel="noopener noreferrer">
						<jb-icon name="github"></jb-icon>
						GitHub
					</a>
				</nav>
				<div class="footer-legal"><span>
					© {{ year }} JiggyBit S.L., built in React, Vue and Angular on one backend.</span>
					<nav class="footer-meta" aria-label="Legal">
						<a routerLink="/privacy">Privacy</a>
					</nav>
				</div>
			</div>
		</footer>
	`,
})
export class FooterComponent {
	protected readonly year = new Date().getFullYear();
}
