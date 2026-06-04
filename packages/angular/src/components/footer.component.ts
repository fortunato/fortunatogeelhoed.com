import { Component } from '@angular/core';

@Component({
	selector: 'app-footer',
	standalone: true,
	styleUrl: '../../../../styles/components/footer.module.css',
	template: `
		<footer class="footer">
			<div class="footer-inner container">
				<span class="footer-brand">
					FORTUNATO<span class="footer-dot">.</span>GEELHOED
				</span>
				<nav class="footer-links" aria-label="Social and external links">
					<a href="https://www.linkedin.com/in/fortunatogeelhoed/">LinkedIn</a>
					<a href="https://github.com/fortunatogeelhoed">GitHub</a>
					<a href="mailto:info@jiggybit.com">Email</a>
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
