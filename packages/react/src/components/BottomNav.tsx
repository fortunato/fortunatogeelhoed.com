import { NAV_ITEMS } from '@fg/shared';
import styles from '@styles/components/bottom-nav.module.css';
import { NavLink } from 'react-router';

// Mobile-first primary navigation (fixed bottom tab bar; hidden on wide viewports
// where the header's top-bar nav takes over). Driven by the shared NAV_ITEMS.
export function BottomNav() {
	return (
		<nav className={styles['bottom-nav']} aria-label="Primary">
			{NAV_ITEMS.map((item) => (
				<NavLink
					key={item.path}
					to={item.path}
					end={item.path === '/'}
					viewTransition
					className={styles['bottom-nav-item']}
				>
					<jb-icon name={item.icon} />
					{item.label}
				</NavLink>
			))}
		</nav>
	);
}
