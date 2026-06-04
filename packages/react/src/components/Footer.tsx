import styles from '@styles/components/footer.module.css';

export function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={`${styles['footer-inner']} container`}>
				<span className={styles['footer-brand']}>
					FORTUNATO<span className={styles['footer-dot']}>.</span>GEELHOED
				</span>
				<nav className={styles['footer-links']} aria-label="Social and external links">
					<a href="https://www.linkedin.com/in/fortunatogeelhoed/">LinkedIn</a>
					<a href="https://github.com/fortunatogeelhoed">GitHub</a>
					<a href="mailto:info@jiggybit.com">Email</a>
				</nav>
				<p className={styles['footer-legal']}>
					© {new Date().getFullYear()} JiggyBit S.L. — built in React, Vue and Angular on
					one backend.
				</p>
			</div>
		</footer>
	);
}
