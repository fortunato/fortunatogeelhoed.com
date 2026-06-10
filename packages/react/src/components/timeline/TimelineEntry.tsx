import type { TimelineEntry as Entry, Lane } from '@fg/shared';
import {
	AGENCY_LABEL,
	EMPLOYMENT_TYPE_LABELS,
	LANE_LABELS,
	entryMatchesTech,
	isExternalHref,
	techVisual,
} from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import { type CSSProperties, useMemo } from 'react';
import { useTechFilter } from '../../hooks/useTechFilter';
import { Button } from '../ui/Button';

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
	const { isActive, toggle } = useTechFilter();
	const active = isActive(name);
	return (
		<button
			type="button"
			className={styles.pill}
			style={{ '--brand': brand } as CSSProperties}
			aria-pressed={active}
			aria-label={`Filter by ${name}`}
			onClick={() => toggle(name)}
		>
			{icon ? (
				<svg className={styles['pill-icon']} aria-hidden="true">
					<use href={`#i-${icon}`} />
				</svg>
			) : null}
			{name}
		</button>
	);
}

export function TimelineEntry({ entry }: { entry: Entry }) {
	const { active } = useTechFilter();
	const dimmed = useMemo(
		() => active.size > 0 && !entryMatchesTech(entry, active),
		[active, entry],
	);
	return (
		<article
			className={styles.entry}
			data-type={entry.type}
			data-dimmed={dimmed ? 'true' : undefined}
			data-reveal
		>
			<div className={styles.spine}>
				<div className={styles['spine-years']}>{entry.years}</div>
				<div className={styles['spine-client']}>{entry.client}</div>
				<div className={styles['spine-role']}>{entry.role}</div>
				<div className={styles['spine-badges']}>
					<span className="tag tag--status" data-kind={entry.type}>
						{entry.type === 'side-project' ? (
							<svg className={styles['type-icon']} aria-hidden="true">
								<use href="#i-branch" />
							</svg>
						) : null}
						{EMPLOYMENT_TYPE_LABELS[entry.type]}
					</span>
					{entry.agency ? <span className="tag tag--neutral">{AGENCY_LABEL}</span> : null}
				</div>
				{entry.domains?.length ? (
					<div className={styles['spine-domains']}>
						{entry.domains.map((d) => (
							<span key={d} className="tag tag--neutral">
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
								<Button
									key={l.href}
									size="sm"
									variant="secondary"
									href={l.href}
									target="_blank"
									rel="noopener noreferrer"
									title={l.title}
									aria-label={`${l.title ?? l.label} (opens in a new tab)`}
									icon={l.icon}
								>
									{l.label}
								</Button>
							) : (
								<Button
									key={l.href}
									size="sm"
									to={l.href}
									title={l.title}
									icon={l.icon}
								>
									{l.label}
								</Button>
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
