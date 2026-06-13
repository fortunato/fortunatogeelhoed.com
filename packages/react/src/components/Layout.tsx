import { consumeSwitchScroll } from '@fg/shared';
import { useEffect } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { TechFilterProvider } from '../hooks/useTechFilter';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
	// Restore the scroll offset saved by a framework switch (the cross-document load otherwise lands
	// at the top, and ScrollRestoration doesn't carry scroll across documents). Runs once after mount,
	// after ScrollRestoration's own (child) effect, so it wins; the reassemble's opacity fade hides it.
	// Same shared mechanism as Vue/Angular, so all three preserve scroll consistently on switch.
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
			<main id="main" tabIndex={-1}>
				<Outlet />
			</main>
			<Footer />
			<BottomNav />
			<ScrollRestoration />
		</TechFilterProvider>
	);
}
