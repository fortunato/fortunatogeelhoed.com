import { Component } from '@angular/core'

@Component({
	selector: 'app-about',
	standalone: true,
	template: `
		<section>
			<div class="container">
				<span class="section-label">About</span>
				<h2 class="section-title">Fortunato Geelhoed</h2>
				<p style="color: var(--text-secondary)">About page content will be loaded from the content pipeline.</p>
			</div>
		</section>
	`,
})
export class AboutComponent {}
