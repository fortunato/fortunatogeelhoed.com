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
		<section data-band aria-label={copy.label}>
			<div className={`container ${styles['proof-body']}`}>
				<p className="section-label">{copy.label}</p>
				<dl className={styles['proof-grid']}>
					{proof.map((point) => (
						<div key={point.label} className={styles['proof-item']} data-reveal>
							<dt className={styles['proof-label']}>{point.label}</dt>
							<dd className={styles['proof-metric']}>{point.metric}</dd>
						</div>
					))}
				</dl>
			</div>
		</section>
	);
}
