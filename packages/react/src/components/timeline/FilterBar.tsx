import { techVisual } from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import type { CSSProperties } from 'react';
import { useTechFilter } from '../../hooks/useTechFilter';

/** The filter bar: active tech filters as removable chips, a Clear-all, and a live result count.
 *  The bar element is always rendered (its height is reserved in CSS so toggling never shifts the
 *  layout); its contents appear only while a filter is active. */
export function FilterBar({ matchCount, total }: { matchCount: number; total: number }) {
	const { active, toggle, clear } = useTechFilter();
	return (
		<div className={styles['filter-bar']} data-active={active.size > 0 ? 'true' : undefined}>
			{active.size > 0 ? (
				<>
					<span className={styles['filter-bar-label']}>Filtering by</span>
					{[...active].map((name) => {
						const { brand, icon } = techVisual(name);
						return (
							<button
								key={name}
								type="button"
								className={styles['filter-chip']}
								style={{ '--brand': brand } as CSSProperties}
								aria-label={`Remove ${name} filter`}
								onClick={() => toggle(name)}
							>
								{icon ? (
									<svg className={styles['pill-icon']} aria-hidden="true">
										<use href={`#i-${icon}`} />
									</svg>
								) : null}
								{name}
								<svg
									className={styles['filter-chip-x']}
									viewBox="0 0 16 16"
									aria-hidden="true"
								>
									<path
										d="M4 4l8 8M12 4l-8 8"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
									/>
								</svg>
							</button>
						);
					})}
					<button type="button" className={styles['filter-clear']} onClick={clear}>
						Clear all
					</button>
				</>
			) : (
				<span className={styles['filter-hint']}>
					Select any technology to filter the timeline
				</span>
			)}
			{/* Always mounted so the first activation (0 → 1) is announced: screen readers often
			    skip a live region inserted at the same moment as its text. */}
			<p className={styles['filter-count']} aria-live="polite">
				{active.size > 0 ? `${matchCount} of ${total} roles match` : ''}
			</p>
		</div>
	);
}
