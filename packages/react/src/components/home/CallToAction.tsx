import type { HomeContent } from '@fg/shared';
import styles from '@styles/components/home.module.css';
import { Link } from 'react-router';

export function CallToAction({ cta }: { cta: HomeContent['cta'] }) {
	return (
		<section className={styles.cta}>
			<div className="container">
				<h2 className={styles['cta-heading']} data-reveal>
					{cta.heading}
				</h2>
				<Link to={cta.href} className="btn">
					Get in touch
				</Link>
			</div>
		</section>
	);
}
