import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toggleTheme as applyToggleTheme } from '@fg/shared';

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
						<a class="switcher-btn" href="/__switch?to=react">react</a>
						<a class="switcher-btn" href="/__switch?to=vue">vue</a>
						<a class="switcher-btn active" href="/__switch?to=angular">angular</a>
					</div>
				</div>
				<button
					type="button"
					class="theme-toggle"
					(click)="toggleTheme()"
					aria-label="Toggle color theme"
				>
					<svg
						class="moon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
					</svg>
					<svg
						class="sun"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="4" />
						<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
					</svg>
				</button>
			</div>
		</header>
	`,
})
export class HeaderComponent {
	toggleTheme() {
		applyToggleTheme();
	}
}
