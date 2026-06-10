import backend from '@fg/content-data/backend-frameworks.json';
import frontend from '@fg/content-data/frontend-frameworks.json';
import type { FrameworkExposureSpan, HomeContent } from '@fg/shared';
import { INTENSITY_LEGEND, axisTicks, ribbonRows, spansBounds } from '@fg/shared';
import styles from '@styles/components/framework-ribbon.module.css';
import { FrameworkRibbon } from '../timeline/FrameworkRibbon';
import { TextLink } from '../ui/Link';

const frontendFrameworks = frontend as FrameworkExposureSpan[];
const backendFrameworks = backend as FrameworkExposureSpan[];

// Both ribbons share one axis so their years line up.
const bounds = spansBounds(frontendFrameworks, backendFrameworks);
const frontendRows = ribbonRows(frontendFrameworks, bounds);
const backendRows = ribbonRows(backendFrameworks, bounds);
const ticks = axisTicks(bounds);

export function FrameworkExposure({ copy }: { copy: HomeContent['sections']['frameworks'] }) {
	return (
		<section aria-labelledby="frameworks-title">
			<div className={`container ${styles['exposure-body']}`}>
				<p className="section-label">{copy.label}</p>
				<h2 className={`section-title ${styles.head}`} id="frameworks-title">
					{copy.title}
				</h2>
				<p className={styles.intro}>{copy.intro}</p>
				<FrameworkRibbon title="Frontend Frameworks" rows={frontendRows} ticks={ticks} />
				<FrameworkRibbon title="Backend & CMS" rows={backendRows} ticks={ticks} />
				<ul className={styles['ribbon-legend']}>
					{INTENSITY_LEGEND.map((item) => (
						<li key={item.intensity} className={styles['legend-item']}>
							<span
								className={styles['legend-swatch']}
								data-intensity={item.intensity}
							/>
							{item.label}
						</li>
					))}
				</ul>
				<TextLink to={copy.link.href} variant="arrow" className={styles['exposure-link']}>
					{copy.link.label}
				</TextLink>
			</div>
		</section>
	);
}
