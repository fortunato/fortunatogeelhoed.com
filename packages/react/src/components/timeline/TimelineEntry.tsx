import type { TimelineEntry as Entry, Lane } from '@fg/shared';
import { LANE_LABELS, techVisual } from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import type { CSSProperties } from 'react';

const LANES: { key: Lane; cls: string }[] = [
	{ key: 'frontend', cls: 'lane-fe' },
	{ key: 'backend', cls: 'lane-be' },
	{ key: 'cicd', cls: 'lane-ci' },
	{ key: 'ai', cls: 'lane-ai' },
];

const TYPE_LABEL: Record<Entry['type'], string> = {
	employee: 'Employee',
	independent: 'Independent',
	'side-project': 'Side project',
};

function highlights(entry: Entry): string[] {
	if (!entry.highlight) return [];
	return Array.isArray(entry.highlight) ? entry.highlight : [entry.highlight];
}

function Pill({ name }: { name: string }) {
	const { brand, icon } = techVisual(name);
	return (
		<span className={styles.pill} style={{ '--brand': brand } as CSSProperties}>
			{icon ? (
				<svg className={styles['pill-icon']} aria-hidden="true">
					<use href={`#i-${icon}`} />
				</svg>
			) : null}
			{name}
		</span>
	);
}

export function TimelineEntry({ entry }: { entry: Entry }) {
	return (
		<article className={styles.entry} data-type={entry.type} data-reveal>
			<div className={styles.spine}>
				<div className={styles['spine-years']}>{entry.years}</div>
				<div className={styles['spine-client']}>{entry.client}</div>
				<div className={styles['spine-role']}>{entry.role}</div>
				<span className={styles['spine-type']} data-type={entry.type}>
					{entry.type === 'side-project' ? (
						<svg className={styles['type-icon']} aria-hidden="true">
							<use href="#i-branch" />
						</svg>
					) : null}
					{TYPE_LABEL[entry.type]}
				</span>
				{highlights(entry).map((h) => (
					<div key={h} className={styles['spine-highlight']}>
						{h}
					</div>
				))}
			</div>

			{LANES.map(({ key, cls }) =>
				entry.tech[key]?.length ? (
					<div
						key={key}
						className={`${styles.lane} ${styles[cls]}`}
						data-lane-label={LANE_LABELS[key]}
					>
						{entry.tech[key]?.map((t) => (
							<Pill key={t} name={t} />
						))}
					</div>
				) : null,
			)}
		</article>
	);
}
