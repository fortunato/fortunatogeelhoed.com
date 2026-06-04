import type { HomeContent } from '@fg/shared';
import styles from '@styles/components/home.module.css';

const WALLPAPER_LINE = 'FORTUNATO.GEELHOED  '.repeat(6);
const WALLPAPER_LINES = Array.from({ length: 14 }, (_, i) => i);

export function Hero({ hero }: { hero: HomeContent['hero'] }) {
	return (
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
					{hero.tagline}
				</p>
				<h1 className={styles['hero-name']} data-enter="2">
					{hero.name}
				</h1>
				<p className={styles['hero-statement']} data-enter="3">
					{hero.statement}
				</p>
			</div>
		</section>
	);
}
