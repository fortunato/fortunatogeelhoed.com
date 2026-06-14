import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { consumeSwitchScroll, initNavMotion, replayEntrance, smoothScrollToTop } from '@fg/shared';
import { filter } from 'rxjs';
import { BottomNavComponent } from './components/bottom-nav.component';
import { FooterComponent } from './components/footer.component';
import { HeaderComponent } from './components/header.component';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, HeaderComponent, FooterComponent, BottomNavComponent],
	// data-nav-enter is baked into the prerendered markup so the landing entrance plays from first
	// paint with no flash; the shared interceptor re-toggles it on each in-app navigation.
	template:
		'<a class="skip-link" href="#main">Skip to content</a><app-header /><main id="main" tabindex="-1" data-nav-enter><router-outlet /></main><app-footer /><app-bottom-nav />',
})
export class AppComponent {
	constructor() {
		// Browser-only (this constructor also runs during prerender).
		if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
		const router = inject(Router);

		// Own scroll ourselves; keep the browser from racing its native restore against the tween.
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}

		// In-app navigation smooth-scrolls to the top, then plays the destination's entrance. The
		// shared interceptor owns the sequence (identical in React, Vue, Angular) and commits the
		// route only after the scroll settles. The router's own scroll restoration is disabled, so
		// nothing fights this.
		initNavMotion((path) => {
			void router.navigateByUrl(path);
		});

		// Back/forward don't pass through the link interceptor, and Angular routing is async — the
		// window 'popstate' fires before the view commits — so we sequence off NavigationEnd instead
		// of the shared window listener: once the popstate view has committed, run the same shared
		// smooth-scroll-to-top then replay the entrance, matching the click path. Anchor links are
		// native, so this never steps on an in-page hash jump.
		let trigger: 'imperative' | 'popstate' | 'hashchange' = 'imperative';
		router.events
			.pipe(filter((e): e is NavigationStart => e instanceof NavigationStart))
			.subscribe((e) => {
				trigger = e.navigationTrigger ?? 'imperative';
			});

		// Restore the offset saved on a framework-switch arrival (the cross-document load lands at
		// the top otherwise), but only on the first navigation. Re-assert across frames until the
		// page is tall enough to hold the offset — a prerendered prod load is ready in one pass; a
		// client-only render grows over a few frames, so a single scrollTo would clamp to 0.
		let first = true;
		router.events
			.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
			.subscribe(() => {
				if (first) {
					first = false;
					const y = consumeSwitchScroll();
					if (y !== null) {
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
				if (trigger === 'popstate' && !location.hash) {
					void smoothScrollToTop().finally(replayEntrance);
				}
			});
	}
}
