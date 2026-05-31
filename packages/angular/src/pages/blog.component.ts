import { Component } from '@angular/core'

@Component({
	selector: 'app-blog',
	standalone: true,
	template: `
		<section>
			<div class="container">
				<span class="section-label">Writing</span>
				<h2 class="section-title">Blog</h2>
				<p style="color: var(--text-secondary)">Blog posts will be loaded from the content pipeline.</p>
			</div>
		</section>
	`,
})
export class BlogComponent {}
