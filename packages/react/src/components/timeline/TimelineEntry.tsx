import type { TimelineEntry as Entry, Lane } from '@fg/shared';
import {
	AGENCY_LABEL,
	EMPLOYMENT_TYPE_LABELS,
	LANE_LABELS,
	isExternalHref,
	techVisual,
} from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';

const LANES: { key: Lane; cls: string }[] = [
	{ key: 'frontend', cls: 'lane-fe' },
	{ key: 'backend', cls: 'lane-be' },
	{ key: 'cicd', cls: 'lane-ci' },
	{ key: 'ai', cls: 'lane-ai' },
];

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
				<div className={styles['spine-badges']}>
					<span className={styles['spine-type']} data-type={entry.type}>
						{entry.type === 'side-project' ? (
							<svg className={styles['type-icon']} aria-hidden="true">
								<use href="#i-branch" />
							</svg>
						) : null}
						{EMPLOYMENT_TYPE_LABELS[entry.type]}
					</span>
					{entry.agency ? (
						<span className={styles['spine-agency']}>{AGENCY_LABEL}</span>
					) : null}
				</div>
				{entry.domains?.length ? (
					<div className={styles['spine-domains']}>
						{entry.domains.map((d) => (
							<span key={d} className={styles.domain}>
								{d}
							</span>
						))}
					</div>
				) : null}
				{highlights(entry).map((h) => (
					<div key={h} className={styles['spine-highlight']}>
						{h}
					</div>
				))}
				{entry.links?.length ? (
					<div className={styles['spine-links']}>
						{entry.links.map((l) =>
							isExternalHref(l.href) ? (
								<a
									key={l.href}
									href={l.href}
									className={`${styles['spine-link']} ${styles['spine-link-external']}`}
									target="_blank"
									rel="noopener noreferrer"
									title={l.title}
									aria-label={`${l.title ?? l.label} (opens in a new tab)`}
								>
									{l.icon ? <jb-icon name={l.icon} /> : null}
									{l.label}
								</a>
							) : (
								<Link
									key={l.href}
									to={l.href}
									className={styles['spine-link']}
									title={l.title}
								>
									{l.icon ? <jb-icon name={l.icon} /> : null}
									{l.label}
								</Link>
							),
						)}
					</div>
				) : null}
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
