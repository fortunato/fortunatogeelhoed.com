import pageData from '@fg/content-data/timeline-page.json';
import timelineData from '@fg/content-data/timeline.json';
import type { TimelineData, TimelinePageCopy } from '@fg/shared';
import {
	LANES,
	LANE_LABELS,
	TECH_SPRITE,
	destroyTimelineMotion,
	initTimelineMotion,
} from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import { Fragment, useEffect, useRef } from 'react';
import { TimelineEntry } from '../components/timeline/TimelineEntry';

const data = timelineData as TimelineData;
const page = pageData as TimelinePageCopy;

export function Timeline() {
	const rootRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const root = rootRef.current;
		if (root) initTimelineMotion(root);
		return () => destroyTimelineMotion();
	}, []);

	let lastEra = '';

	return (
		<section className={styles.page} ref={rootRef}>
			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted in-house icon sprite */}
			<div hidden dangerouslySetInnerHTML={{ __html: TECH_SPRITE }} />

			<div className="container">
				<p className="section-label">{page.label}</p>
				<h1 className="section-title">{page.title}</h1>
				<p className={styles.intro}>{page.intro}</p>
			</div>

			<div className={styles.timeline}>
				<div className={styles['lane-headers']} aria-hidden="true">
					<div className={styles['lane-header']} />
					{LANES.map((lane) => (
						<div key={lane} className={styles['lane-header']}>
							{LANE_LABELS[lane]}
						</div>
					))}
				</div>

				{data.entries.map((entry) => {
					const showEra = entry.era !== lastEra;
					lastEra = entry.era;
					return (
						<Fragment key={entry.id}>
							{showEra ? (
								<div className={styles.era} data-reveal>
									<span className={styles['era-label']}>{entry.era}</span>
								</div>
							) : null}
							<TimelineEntry entry={entry} />
						</Fragment>
					);
				})}
			</div>
		</section>
	);
}
