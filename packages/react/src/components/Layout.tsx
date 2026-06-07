import { Outlet, ScrollRestoration } from 'react-router';
import { TechFilterProvider } from '../hooks/useTechFilter';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
	return (
		// The timeline filter lives above the outlet so a selection survives navigating away and back.
		<TechFilterProvider>
			<Header />
			<main>
				<Outlet />
			</main>
			<Footer />
			<BottomNav />
			<ScrollRestoration />
		</TechFilterProvider>
	);
}
