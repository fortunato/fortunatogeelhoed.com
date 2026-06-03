import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [RouterLink],
	// Allow the <jb-*> custom elements in this template.
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
				<jb-theme-toggle></jb-theme-toggle>
			</div>
		</header>
	`,
})
export class HeaderComponent {}
