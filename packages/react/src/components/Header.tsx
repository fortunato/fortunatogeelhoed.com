import styles from '@styles/components/header.module.css';
import { Link } from 'react-router';

function switchFramework(fw: string) {
	document.cookie = `framework=${fw};path=/;max-age=31536000`;
	const port = window.location.port;
	if (port === '5173' || port === '5174' || port === '5175') {
		window.location.href = `http://localhost:3000${window.location.pathname}`;
	} else {
		window.location.reload();
	}
}

export function Header() {
	return (
		<header className={styles.header}>
			<Link to="/" className={styles.logo}>
				FORTUNATO<span className={styles.dot}>.</span>GEELHOED
			</Link>
			<div className={styles.headerRight}>
				<nav className={styles.nav}>
					<Link to="/services">Services</Link>
					<Link to="/work">Work</Link>
					<Link to="/blog">Blog</Link>
					<Link to="/contact">Contact</Link>
				</nav>
				<div className={styles.sep} />
				<div className={styles.switcher}>
					<span className={styles.switcherLabel}>Built with</span>
					<div className={styles.switcherButtons}>
						<button
							type="button"
							className={`${styles.switcherBtn} ${styles.active}`}
							onClick={() => switchFramework('react')}
						>
							react
						</button>
						<button
							type="button"
							className={styles.switcherBtn}
							onClick={() => switchFramework('vue')}
						>
							vue
						</button>
						<button
							type="button"
							className={styles.switcherBtn}
							onClick={() => switchFramework('angular')}
						>
							angular
						</button>
					</div>
				</div>
			</div>
		</header>
	);
}
