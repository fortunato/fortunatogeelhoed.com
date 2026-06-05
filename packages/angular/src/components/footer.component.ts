import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';

@Component({
	selector: 'app-footer',
	standalone: true,
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
				<p class="footer-legal">
					© {{ year }} JiggyBit S.L. — built in React, Vue and Angular on one backend.
				</p>
			</div>
		</footer>
	`,
})
export class FooterComponent {
	protected readonly year = new Date().getFullYear();
}
