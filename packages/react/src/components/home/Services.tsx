import type { ServiceOffering } from '@fg/shared';
import styles from '@styles/components/home.module.css';

export function Services({ services }: { services: ServiceOffering[] }) {
	return (
		<section>
			<div className="container">
				<p className="section-label">What I do</p>
				<h2 className="section-title">Services</h2>
				<div className={styles['services-grid']}>
					{services.map((service) => (
						<article key={service.title} className="card" data-reveal>
							<h3 className={styles['service-title']}>{service.title}</h3>
							<p className={styles['service-desc']}>{service.description}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
