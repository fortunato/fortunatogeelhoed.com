import { Component } from '@angular/core';

@Component({
	selector: 'app-home',
	standalone: true,
	template: `
		<section class="hero">
			<div class="container">
				<h1 style="font-family: var(--font-display); font-size: clamp(3rem, 10vw, 8rem); font-weight: 800">
					FORTUNATO
				</h1>
				<p class="section-label">Senior Full-Stack Engineer &amp; Technical Lead</p>
				<p style="color: var(--text-secondary); max-width: 600px; margin-top: var(--space-lg)">
					I <strong>build</strong>, <strong>fix</strong>, and <strong>lead</strong> TypeScript platforms.
				</p>
			</div>
		</section>
	`,
})
export class HomeComponent {}
