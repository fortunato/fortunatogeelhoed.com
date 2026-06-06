import type { ServiceOffering } from '@fg/shared';
import { initCardSpotlight } from '@fg/shared';
import styles from '@styles/components/services.module.css';
import { useEffect, useRef } from 'react';

export function Services({ services }: { services: ServiceOffering[] }) {
	const gridRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (gridRef.current) return initCardSpotlight(gridRef.current);
	}, []);

	return (
		<section>
			<div className={`container ${styles['services-body']}`}>
				<p className="section-label">What I do</p>
				<h2 className="section-title">Services</h2>
				<div className={styles['services-grid']} ref={gridRef}>
					{services.map((service, i) => (
						<article
							key={service.title}
							className={styles['service-card']}
							data-reveal
							data-spotlight
						>
							<span className={styles['service-index']}>
								{String(i + 1).padStart(2, '0')}
							</span>
							<h3 className={styles['service-title']}>{service.title}</h3>
							<p className={styles['service-desc']}>{service.description}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
