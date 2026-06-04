import type { Lane, TimelineData, TimelineEntry } from '@fg/shared';
import {
	LANE_LABELS,
	axisTicks,
	destroySmoothScroll,
	initSmoothScroll,
	ribbonRows,
} from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import { useEffect } from 'react';
import timelineData from '../../../content/timeline.json';

const data = timelineData as TimelineData;
const rows = ribbonRows(data);
const ticks = axisTicks(data);

const LEFT_LANES: { key: Lane; cls: string }[] = [
	{ key: 'ai-llm', cls: 'lane-ai' },
	{ key: 'ci-cd', cls: 'lane-cicd' },
	{ key: 'database', cls: 'lane-db' },
	{ key: 'backend', cls: 'lane-be' },
];

const INTENSITY_LEGEND: { intensity: string; label: string }[] = [
	{ intensity: 'professional', label: 'Professional / daily' },
	{ intensity: 'occasional', label: 'Side-project' },
	{ intensity: 'brief', label: 'Brief' },
];

function period(entry: TimelineEntry): string {
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

export function Timeline() {
	useEffect(() => {
		initSmoothScroll();
		return () => destroySmoothScroll();
	}, []);

	return (
		<section className={styles.page}>
			<div className="container">
				<p className="section-label">Career</p>
				<h1 className="section-title">Twenty-five years, five lanes</h1>
				<p className={styles.intro}>
					From classic ASP and Flash to React, NestJS and agentic workflows — a working
					life across the frontend, backend, infrastructure and, lately, AI. Frameworks
					deepen, the AI lane fills in, and a trading system runs quietly alongside it
					all.
				</p>
			</div>

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
							<span
								className={styles['legend-swatch']}
								data-intensity={item.intensity}
							/>
							{item.label}
						</span>
					))}
				</div>
			</div>

			<div className={styles.timeline}>
				<div className={styles['lane-labels']} aria-hidden="true">
					<span className={styles['lane-head']} data-side="left">
						AI / LLM
					</span>
					<span className={styles['lane-head']} data-side="left">
						CI / CD
					</span>
					<span className={styles['lane-head']} data-side="left">
						Database
					</span>
					<span className={styles['lane-head']} data-side="left">
						Backend
					</span>
					<span className={styles['lane-head']}>Year</span>
					<span className={styles['lane-head']}>Role</span>
					<span className={styles['lane-head']}>Frontend</span>
				</div>

				{data.entries.map((entry) => (
					<article
						key={entry.id}
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
							{entry.summary ? (
								<p className={styles['role-summary']}>{entry.summary}</p>
							) : null}
							{entry.isSideProject ? (
								<span className={styles['role-badge']}>Side project</span>
							) : null}
						</div>

						{entry.tech.frontend?.length ? (
							<div
								className={`${styles.lane} ${styles['lane-fe']}`}
								data-lane-label="Frontend"
							>
								<Tags items={entry.tech.frontend} />
							</div>
						) : null}
					</article>
				))}
			</div>
		</section>
	);
}
