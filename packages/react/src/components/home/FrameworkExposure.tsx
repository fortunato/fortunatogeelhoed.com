import type { FrameworkExposureSpan } from '@fg/shared';
import { axisTicks, ribbonRows, spansBounds } from '@fg/shared';
import styles from '@styles/components/framework-ribbon.module.css';
import backend from '../../../../content/backend-frameworks.json';
import frontend from '../../../../content/frontend-frameworks.json';
import { FrameworkRibbon } from '../timeline/FrameworkRibbon';

const frontendFrameworks = frontend as FrameworkExposureSpan[];
const backendFrameworks = backend as FrameworkExposureSpan[];

// Both ribbons share one axis so their years line up.
const bounds = spansBounds(frontendFrameworks, backendFrameworks);
const frontendRows = ribbonRows(frontendFrameworks, bounds);
const backendRows = ribbonRows(backendFrameworks, bounds);
const ticks = axisTicks(bounds);

const INTENSITY_LEGEND: { intensity: string; label: string }[] = [
	{ intensity: 'professional', label: 'Professional / daily' },
	{ intensity: 'occasional', label: 'Occasional' },
	{ intensity: 'brief', label: 'Brief' },
];

export function FrameworkExposure() {
	return (
		<section>
			<div className="container">
				<p className="section-label">Frameworks</p>
				<h2 className={`section-title ${styles.head}`}>
					Frameworks come and go. The craft compounds.
				</h2>
				<p className={styles.intro}>
					Twenty-five years on the web means living through every frontend era and the
					backends beneath it — and staying fluent while the stack reinvents itself.
				</p>
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
