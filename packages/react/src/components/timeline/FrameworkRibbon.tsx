import type { AxisTick, RibbonRow } from '@fg/shared';
import styles from '@styles/components/framework-ribbon.module.css';

/** A single framework ribbon: a title, one labelled track per framework, and its own year
 *  axis. Ticks are computed from the bounds shared across ribbons, so the axes line up. The
 *  legend is rendered once by the enclosing section. */
export function FrameworkRibbon({
	title,
	rows,
	ticks,
}: {
	title: string;
	rows: RibbonRow[];
	ticks: AxisTick[];
}) {
	return (
		<div className={styles.ribbon}>
			<p className={styles['ribbon-title']}>{title}</p>
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
			<ul className={styles['ribbon-rows']}>
				{rows.map((row) => (
					<li key={row.framework} className={styles['ribbon-row']}>
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
					</li>
				))}
			</ul>
		</div>
	);
}
