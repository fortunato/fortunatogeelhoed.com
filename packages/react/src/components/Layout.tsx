import { Outlet } from 'react-router';
import { Header } from './Header';

export function Layout() {
	return (
		<>
			<Header />
			<main>
				<Outlet />
			</main>
		</>
	);
}
