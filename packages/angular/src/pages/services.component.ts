import { Component } from '@angular/core'

@Component({
	selector: 'app-services',
	standalone: true,
	template: `
		<section>
			<div class="container">
				<span class="section-label">What I Do</span>
				<h2 class="section-title">Services</h2>
				<p style="color: var(--text-secondary)">Services page content will be loaded from the content pipeline.</p>
			</div>
		</section>
	`,
})
export class ServicesComponent {}
