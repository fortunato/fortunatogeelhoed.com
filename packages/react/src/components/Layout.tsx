import { Outlet, ScrollRestoration } from 'react-router';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
	return (
		<>
			<Header />
			<main>
				<Outlet />
			</main>
			<Footer />
			<BottomNav />
			<ScrollRestoration />
		</>
	);
}
