import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { consumeSwitchScroll } from '@fg/shared';
import { filter } from 'rxjs';
import { BottomNavComponent } from './components/bottom-nav.component';
import { FooterComponent } from './components/footer.component';
import { HeaderComponent } from './components/header.component';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, HeaderComponent, FooterComponent, BottomNavComponent],
	template:
		'<a class="skip-link" href="#main">Skip to content</a><app-header /><main id="main" tabindex="-1"><router-outlet /></main><app-footer /><app-bottom-nav />',
})
export class AppComponent {
	constructor() {
		// All scroll handling for Angular (the router's own restoration is 'disabled' so nothing
		// fights this): reset to the top on navigation, except the first navigation arriving via a
		// framework switch, where we restore the offset saved on the outgoing page so Angular matches
		// React/Vue's preserve-scroll behaviour. The reassemble's opacity fade hides the reposition.
		// Browser-only (this constructor also runs during prerender). Anchor links are native (no
		// router fragments), so the top reset never steps on them.
		if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
		let first = true;
		inject(Router)
			.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
			.subscribe(() => {
				if (first) {
					first = false;
					const y = consumeSwitchScroll();
					if (y !== null) {
						// Re-assert across frames until the page is tall enough to hold the offset. In a
						// prerendered prod load the height is there immediately (one pass); in a dev /
						// client-only render it grows over a few frames, so a single scrollTo would clamp
						// to 0. The reassemble's opacity fade hides the settle. Capped so it always ends.
						let tries = 0;
						const apply = () => {
							window.scrollTo(0, y);
							const max = document.documentElement.scrollHeight - window.innerHeight;
							if (window.scrollY < y - 2 && max < y && tries++ < 40)
								requestAnimationFrame(apply);
						};
						apply();
						return;
					}
				}
				if (!location.hash) window.scrollTo(0, 0);
			});
	}
}
