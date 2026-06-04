import type { TimelineData } from '@fg/shared';
import { axisTicks, ribbonRows } from '@fg/shared';
import styles from '@styles/components/timeline.module.css';

const INTENSITY_LEGEND: { intensity: string; label: string }[] = [
	{ intensity: 'professional', label: 'Professional / daily' },
	{ intensity: 'occasional', label: 'Side-project' },
	{ intensity: 'brief', label: 'Brief' },
];

export function FrameworkRibbon({ data }: { data: TimelineData }) {
	const rows = ribbonRows(data);
	const ticks = axisTicks(data);

	return (
		<div className={`${styles.ribbon} container`}>
			<p className={styles['ribbon-title']}>Framework exposure</p>
			{rows.map((row) => (
				<div key={row.framework} className={styles['ribbon-row']}>
					<span className={styles['ribbon-label']}>{row.framework}</span>
					<div className={styles['ribbon-track']}>
						{row.segments.map((seg, i) => (
							<span
								// biome-ignore lint/suspicious/noArrayIndexKey: segments are positional and stable
								key={i}
								className={styles['ribbon-seg']}
								data-intensity={seg.intensity}
								style={{
									left: `${seg.left}%`,
									...(seg.intensity !== 'brief'
										? { width: `${seg.width}%` }
										: {}),
								}}
							/>
						))}
					</div>
				</div>
			))}
			<div className={styles['ribbon-axis']}>
				{ticks.map((tick) => (
					<span
						key={tick.year}
						className={styles['ribbon-tick']}
						style={{ left: `${tick.left}%` }}
					>
						{tick.year}
					</span>
				))}
			</div>
			<div className={styles['ribbon-legend']}>
				{INTENSITY_LEGEND.map((item) => (
					<span key={item.intensity} className={styles['legend-item']}>
						<span className={styles['legend-swatch']} data-intensity={item.intensity} />
						{item.label}
					</span>
				))}
			</div>
		</div>
	);
}
