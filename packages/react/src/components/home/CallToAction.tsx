import type { HomeContent } from '@fg/shared';
import styles from '@styles/components/cta.module.css';
import { Button } from '../ui/Button';

export function CallToAction({ cta }: { cta: HomeContent['cta'] }) {
	return (
		<section className={styles.cta}>
			<div className="container">
				<div className={styles['cta-panel']}>
					<h2 className={styles['cta-heading']} data-reveal>
						{cta.heading}
					</h2>
					<Button to={cta.href} variant="inverted" tone="marketing">
						{cta.label}
					</Button>
				</div>
			</div>
		</section>
	);
}
