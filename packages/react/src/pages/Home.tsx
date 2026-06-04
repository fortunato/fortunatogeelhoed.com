import type { HomeContent } from '@fg/shared';
import styles from '@styles/components/home.module.css';
import { Link } from 'react-router';
import homeData from '../../../content/home.json';

const home = homeData as HomeContent;

const WALLPAPER_LINE = 'FORTUNATO.GEELHOED  '.repeat(6);
const WALLPAPER_LINES = Array.from({ length: 14 }, (_, i) => i);

export function Home() {
	return (
		<>
			<section className={styles.hero}>
				<div className={styles['hero-wallpaper']} aria-hidden="true">
					{WALLPAPER_LINES.map((i) => (
						<div key={i} className={styles['hero-wallpaper-line']}>
							{WALLPAPER_LINE}
						</div>
					))}
				</div>
				<div className={`${styles['hero-content']} container`}>
					<p className="section-label" data-enter="1">
						{home.hero.tagline}
					</p>
					<h1 className={styles['hero-name']} data-enter="2">
						{home.hero.name}
					</h1>
					<p className={styles['hero-statement']} data-enter="3">
						{home.hero.statement}
					</p>
				</div>
			</section>

			<section>
				<div className="container">
					<p className="section-label">What I do</p>
					<h2 className="section-title">Services</h2>
					<div className={styles['services-grid']}>
						{home.services.map((service) => (
							<article key={service.title} className="card" data-reveal>
								<h3 className={styles['service-title']}>{service.title}</h3>
								<p className={styles['service-desc']}>{service.description}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className={styles.proof}>
				<div className="container">
					<p className="section-label">Proof</p>
					<div className={styles['proof-grid']}>
						{home.proof.map((point) => (
							<div key={point.label} data-reveal>
								<p className={styles['proof-metric']}>{point.metric}</p>
								<p className={styles['proof-label']}>{point.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section>
				<div className="container">
					<p className="section-label">Latest writing</p>
					<h2 className="section-title">From the blog</h2>
					<div className={styles['writing-grid']}>
						{home.writing.map((post) => (
							<Link
								key={post.title}
								to={post.href}
								className={`card ${styles['writing-card']}`}
								data-reveal
							>
								<h3 className={styles['writing-title']}>{post.title}</h3>
								<p className={styles['writing-blurb']}>{post.blurb}</p>
								<span className={styles['writing-more']}>Read more →</span>
							</Link>
						))}
					</div>
				</div>
			</section>

			<section className={styles.cta}>
				<div className="container">
					<h2 className={styles['cta-heading']} data-reveal>
						{home.cta.heading}
					</h2>
					<Link to={home.cta.href} className="btn">
						Get in touch
					</Link>
				</div>
			</section>
		</>
	);
}
