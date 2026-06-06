import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '@fg/shared';

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [RouterLink, RouterLinkActive],
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
					@for (item of navItems; track item.path) {
						<a
							[routerLink]="item.path"
							routerLinkActive
							[routerLinkActiveOptions]="{ exact: item.path === '/' }"
							ariaCurrentWhenActive="page"
						>{{ item.label }}</a>
					}
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
				<a
					class="icon-btn"
					href="https://github.com/fortunato/fortunatogeelhoed.com"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="View source on GitHub (opens in a new tab)"
				>
					<jb-icon name="github"></jb-icon>
				</a>
				<jb-theme-toggle></jb-theme-toggle>
			</div>
		</header>
	`,
})
export class HeaderComponent {
	protected readonly navItems = NAV_ITEMS;
}
