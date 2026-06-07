import backend from '@fg/content-data/backend-frameworks.json';
import frontend from '@fg/content-data/frontend-frameworks.json';
import type { FrameworkExposureSpan, HomeContent } from '@fg/shared';
import { INTENSITY_LEGEND, axisTicks, ribbonRows, spansBounds } from '@fg/shared';
import styles from '@styles/components/framework-ribbon.module.css';
import { FrameworkRibbon } from '../timeline/FrameworkRibbon';

const frontendFrameworks = frontend as FrameworkExposureSpan[];
const backendFrameworks = backend as FrameworkExposureSpan[];

// Both ribbons share one axis so their years line up.
const bounds = spansBounds(frontendFrameworks, backendFrameworks);
const frontendRows = ribbonRows(frontendFrameworks, bounds);
const backendRows = ribbonRows(backendFrameworks, bounds);
const ticks = axisTicks(bounds);

export function FrameworkExposure({ copy }: { copy: HomeContent['sections']['frameworks'] }) {
	return (
		<section className={styles.exposure}>
			<div className={`container ${styles['exposure-body']}`}>
				<p className="section-label">{copy.label}</p>
				<h2 className={`section-title ${styles.head}`}>{copy.title}</h2>
				<p className={styles.intro}>{copy.intro}</p>
				<FrameworkRibbon title="Frontend Frameworks" rows={frontendRows} ticks={ticks} />
				<FrameworkRibbon title="Backend &amp; CMS" rows={backendRows} ticks={ticks} />
				<div className={styles['ribbon-legend']}>
					{INTENSITY_LEGEND.map((item) => (
						<span key={item.intensity} className={styles['legend-item']}>
							<span
								className={styles['legend-swatch']}
								data-intensity={item.intensity}
							/>
							{item.label}
						</span>
					))}
				</div>
			</div>
		</section>
	);
}
