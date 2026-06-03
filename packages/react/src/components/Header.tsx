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
				<jb-theme-toggle />
			</div>
		</header>
	);
}
