import type { ProofPoint } from '@fg/shared';
import styles from '@styles/components/home.module.css';

export function ProofStrip({ proof }: { proof: ProofPoint[] }) {
	return (
		<section className={styles.proof}>
			<div className="container">
				<p className="section-label">Proof</p>
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
