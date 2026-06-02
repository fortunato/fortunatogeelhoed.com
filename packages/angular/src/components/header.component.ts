import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [RouterLink],
	styleUrl: '../../../../styles/components/header.module.css',
	template: `
		<header class="header">
			<a routerLink="/" class="logo">
				FORTUNATO<span class="dot">.</span>GEELHOED
			</a>
			<div class="header-right">
				<nav class="nav">
					<a routerLink="/services">Services</a>
					<a routerLink="/work">Work</a>
					<a routerLink="/blog">Blog</a>
					<a routerLink="/contact">Contact</a>
				</nav>
				<div class="sep"></div>
				<div class="switcher">
					<span class="switcher-label">Built with</span>
					<div class="switcher-buttons">
						<button class="switcher-btn" (click)="switchFramework('react')">react</button>
						<button class="switcher-btn" (click)="switchFramework('vue')">vue</button>
						<button class="switcher-btn active" (click)="switchFramework('angular')">angular</button>
					</div>
				</div>
			</div>
		</header>
	`,
})
export class HeaderComponent {
	switchFramework(fw: string) {
		document.cookie = `framework=${fw};path=/;max-age=31536000`;
		const port = window.location.port;
		if (port === '5173' || port === '5174' || port === '5175') {
			window.location.href = `http://localhost:3000${window.location.pathname}`;
		} else {
			window.location.reload();
		}
	}
}
