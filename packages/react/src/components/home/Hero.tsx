import type { HomeContent } from '@fg/shared';
import styles from '@styles/components/hero.module.css';

const WALLPAPER_LINE = 'FORTUNATO.GEELHOED  '.repeat(6);
// Enough lines that the rotated band overflows the 300%-tall container and fills the
// corners (the .hero clips the overflow). Too few leaves the top/bottom corners bare.
const WALLPAPER_LINES = Array.from({ length: 40 }, (_, i) => i);

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
