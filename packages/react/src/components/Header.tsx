import { toggleTheme } from '@fg/shared';
import styles from '@styles/components/header.module.css';
import { Link } from 'react-router';

export function Header() {
	return (
		<header className={styles.header}>
			<Link to="/" className={styles.logo}>
				FORTUNATO<span className={styles.dot}>.</span>GEELHOED
			</Link>
			<div className={styles['header-right']}>
				<nav className={styles.nav}>
					<Link to="/services">Services</Link>
					<Link to="/work">Work</Link>
					<Link to="/blog">Blog</Link>
					<Link to="/contact">Contact</Link>
				</nav>
				<div className={styles.sep} />
				<div className={styles.switcher}>
					<span className={styles['switcher-label']}>Built with</span>
					<div className={styles['switcher-buttons']}>
						<a
							className={`${styles['switcher-btn']} ${styles.active}`}
							href="/__switch?to=react"
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
				<button
					type="button"
					className={styles['theme-toggle']}
					onClick={() => toggleTheme()}
					aria-label="Toggle color theme"
				>
					<svg
						className={styles.moon}
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
					</svg>
					<svg
						className={styles.sun}
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="4" />
						<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
					</svg>
				</button>
			</div>
		</header>
	);
}
