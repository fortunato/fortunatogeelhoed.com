import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '@fg/shared';

// Mobile-first primary navigation (fixed bottom tab bar; hidden on wide viewports).
// Driven by the shared NAV_ITEMS.
@Component({
	selector: 'app-bottom-nav',
	standalone: true,
	imports: [RouterLink, RouterLinkActive],
	// Allow the <jb-icon> custom element in this template.
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	styleUrl: '../../../../styles/components/bottom-nav.module.css',
	template: `
		<nav class="bottom-nav" aria-label="Primary">
			@for (item of navItems; track item.path) {
				<a
					class="bottom-nav-item"
					[routerLink]="item.path"
					routerLinkActive
					[routerLinkActiveOptions]="{ exact: item.path === '/' }"
					ariaCurrentWhenActive="page"
				>
					<jb-icon [attr.name]="item.icon"></jb-icon>
					{{ item.label }}
				</a>
			}
		</nav>
	`,
})
export class BottomNavComponent {
	protected readonly navItems = NAV_ITEMS;
}
