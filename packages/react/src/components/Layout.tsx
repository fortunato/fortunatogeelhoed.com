import { consumeSwitchScroll, initNavMotion, initPopstateMotion } from '@fg/shared';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { TechFilterProvider } from '../hooks/useTechFilter';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
	const navigate = useNavigate();

	// In-app navigation smooth-scrolls to the top, then plays the destination's entrance — the
	// shared interceptor owns the sequence so React, Vue, and Angular match exactly. The router's
	// own push runs only after the scroll settles. Re-wired once; the listener is idempotent.
	useEffect(() => initNavMotion((path) => void navigate(path)), [navigate]);

	// Back/forward mirror the click sequence: smooth-scroll to the top, then replay the entrance.
	// React Router commits the popstate view synchronously, so the shared window listener (which
	// also sets scrollRestoration to 'manual') is enough here. The framework-switch arrival is a
	// fresh document load, not a popstate, so its saved-offset restore below still wins.
	useEffect(() => initPopstateMotion(), []);

	// Restore the scroll offset saved by a framework switch (the cross-document load otherwise lands
	// at the top). Runs once after mount. Same shared mechanism as Vue/Angular. We don't use React
	// Router's ScrollRestoration: every in-app navigation already resets to the top through the
	// shared motion sequence (clicks and back/forward alike), so a per-location offset restore would
	// only fight that — the one offset we do want back is this cross-document switch case.
	useEffect(() => {
		const y = consumeSwitchScroll();
		if (y !== null) window.scrollTo(0, y);
	}, []);

	return (
		// The timeline filter lives above the outlet so a selection survives navigating away and back.
		<TechFilterProvider>
			<a className="skip-link" href="#main">
				Skip to content
			</a>
			<Header />
			{/* data-nav-enter is baked into the prerendered markup so the landing entrance plays from
			    first paint with no flash; the shared interceptor re-toggles it on each in-app nav. */}
			<main id="main" tabIndex={-1} data-nav-enter="">
				<Outlet />
			</main>
			<Footer />
			<BottomNav />
		</TechFilterProvider>
	);
}
