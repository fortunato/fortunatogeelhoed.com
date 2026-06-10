import type { HomeContent, Principle } from '@fg/shared';
import styles from '@styles/components/approach.module.css';

export function Approach({
	principles,
	copy,
}: {
	principles: Principle[];
	copy: HomeContent['sections']['approach'];
}) {
	return (
		<section data-band>
			<div className={`container ${styles['approach-body']}`}>
				<p className="section-label">{copy.label}</p>
				<h2 className="section-title">{copy.title}</h2>
				<div className={styles['approach-grid']}>
					{principles.map((principle) => (
						<article key={principle.title} className={styles.principle} data-reveal>
							<h3 className={styles['principle-title']}>{principle.title}</h3>
							<p className={styles['principle-desc']}>{principle.description}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
