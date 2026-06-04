import type { TimelineEntry as Entry, Lane } from '@fg/shared';
import { LANE_LABELS } from '@fg/shared';
import styles from '@styles/components/timeline.module.css';

const LEFT_LANES: { key: Lane; cls: string }[] = [
	{ key: 'ai-llm', cls: 'lane-ai' },
	{ key: 'ci-cd', cls: 'lane-cicd' },
	{ key: 'database', cls: 'lane-db' },
	{ key: 'backend', cls: 'lane-be' },
];

function period(entry: Entry): string {
	if (entry.endYear === 'present') return `${entry.startYear}–now`;
	return entry.endYear === entry.startYear
		? `${entry.startYear}`
		: `${entry.startYear}–${entry.endYear}`;
}

function Tags({ items }: { items: string[] }) {
	return (
		<>
			{items.map((t) => (
				<span key={t} className="tech-tag">
					{t}
				</span>
			))}
		</>
	);
}

export function TimelineEntry({ entry }: { entry: Entry }) {
	return (
		<article
			className={styles.entry}
			data-side={entry.isSideProject ? 'true' : undefined}
			data-reveal
		>
			{LEFT_LANES.map(({ key, cls }) =>
				entry.tech[key]?.length ? (
					<div
						key={key}
						className={`${styles.lane} ${styles[cls]}`}
						data-lane-label={LANE_LABELS[key]}
					>
						<Tags items={entry.tech[key] ?? []} />
					</div>
				) : null,
			)}

			<div className={styles.spine}>
				<span className={styles['year-node']} data-emp={entry.employmentType}>
					{entry.startYear}
				</span>
			</div>

			<div className={styles.role}>
				<p className={styles['role-period']}>{period(entry)}</p>
				<p className={styles['role-title']}>{entry.role}</p>
				<p className={styles['role-org']}>{entry.organization}</p>
				{entry.summary ? <p className={styles['role-summary']}>{entry.summary}</p> : null}
				{entry.isSideProject ? (
					<span className={styles['role-badge']}>Side project</span>
				) : null}
			</div>

			{entry.tech.frontend?.length ? (
				<div className={`${styles.lane} ${styles['lane-fe']}`} data-lane-label="Frontend">
					<Tags items={entry.tech.frontend} />
				</div>
			) : null}
		</article>
	);
}
