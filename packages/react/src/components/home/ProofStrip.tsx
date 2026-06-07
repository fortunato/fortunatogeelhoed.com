import type { HomeContent, ProofPoint } from '@fg/shared';
import styles from '@styles/components/proof.module.css';

export function ProofStrip({
	proof,
	copy,
}: {
	proof: ProofPoint[];
	copy: HomeContent['sections']['proof'];
}) {
	return (
		<section className={styles.proof}>
			<div className={`container ${styles['proof-body']}`}>
				<p className="section-label">{copy.label}</p>
				<div className={styles['proof-grid']}>
					{proof.map((point) => (
						<div key={point.label} data-reveal>
							<p className={styles['proof-metric']}>{point.metric}</p>
							<p className={styles['proof-label']}>{point.label}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
