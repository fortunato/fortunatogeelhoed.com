import type { HomeContent, ServiceOffering } from '@fg/shared';
import { initCardSpotlight } from '@fg/shared';
import styles from '@styles/components/services.module.css';
import { useEffect, useRef } from 'react';
import { TextLink } from '../ui/Link';

export function Services({
	services,
	copy,
}: {
	services: ServiceOffering[];
	copy: HomeContent['sections']['services'];
}) {
	const gridRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		if (gridRef.current) return initCardSpotlight(gridRef.current);
	}, []);

	return (
		<section aria-labelledby="services-title">
			<div className={`container ${styles['services-body']}`}>
				<p className="section-label">{copy.label}</p>
				<h2 className="section-title" id="services-title">
					{copy.title}
				</h2>
				<ul className={styles['services-grid']} ref={gridRef}>
					{services.map((service, i) => (
						<li
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
						</li>
					))}
				</ul>
				<TextLink to={copy.link.href} variant="arrow" className={styles['services-link']}>
					{copy.link.label}
				</TextLink>
			</div>
		</section>
	);
}
