import { NAV_ITEMS } from '@fg/shared';
import styles from '@styles/components/header.module.css';
import { Link, NavLink } from 'react-router';

export function Header() {
	return (
		<header className={styles.header}>
			<Link to="/" className={styles.logo}>
				FORTUNATO<span className={styles.dot}>.</span>GEELHOED
			</Link>
			<div className={styles['header-right']}>
				<nav className={styles.nav} aria-label="Primary">
					{NAV_ITEMS.map((item) => (
						<NavLink
							key={item.path}
							to={item.path}
							end={item.path === '/'}
							viewTransition
						>
							{item.label}
						</NavLink>
					))}
				</nav>
				<div className={styles.sep} />
				<div className={styles.switcher}>
					<span className={styles['switcher-label']}>Built with</span>
					<div className={styles['switcher-buttons']}>
						<a
							className={`${styles['switcher-btn']} ${styles.active}`}
							href="/__switch?to=react"
							aria-current="true"
						>
							react
						</a>
						<a className={styles['switcher-btn']} href="/__switch?to=vue">
							vue
						</a>
						<a className={styles['switcher-btn']} href="/__switch?to=angular">
							angular
						</a>
					</div>
				</div>
				<a
					className={styles['icon-btn']}
					href="https://github.com/fortunato/fortunatogeelhoed.com"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="View source on GitHub (opens in a new tab)"
				>
					<jb-icon name="github" />
				</a>
				<jb-theme-toggle />
			</div>
		</header>
	);
}
