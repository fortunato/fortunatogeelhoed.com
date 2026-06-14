import styles from '@styles/components/footer.module.css';
import { Link } from 'react-router';

export function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={`${styles['footer-inner']} container`}>
				<span className={styles['footer-brand']}>
					FORTUNATO<span className={styles['footer-dot']}>.</span>GEELHOED
				</span>
				<nav className={styles['footer-links']} aria-label="Social and external links">
					<a
						href="https://www.linkedin.com/in/fortunatogeelhoed/"
						target="_blank"
						rel="noopener noreferrer"
					>
						<jb-icon name="linkedin" />
						LinkedIn
					</a>
					<a
						href="https://github.com/fortunato"
						target="_blank"
						rel="noopener noreferrer"
					>
						<jb-icon name="github" />
						GitHub
					</a>
				</nav>
				<div className={styles['footer-legal']}>
					<span>
						© {new Date().getFullYear()} JiggyBit S.L., built in React, Vue and Angular
						on one backend.
					</span>
					<nav className={styles['footer-meta']} aria-label="Legal">
						<Link to="/privacy">Privacy</Link>
					</nav>
				</div>
			</div>
		</footer>
	);
}
