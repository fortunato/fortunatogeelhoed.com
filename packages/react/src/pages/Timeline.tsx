import pageData from '@fg/content-data/timeline-page.json';
import timelineData from '@fg/content-data/timeline.json';
import type { TimelineData, TimelinePageCopy } from '@fg/shared';
import {
	LANES,
	LANE_LABELS,
	TECH_SPRITE,
	destroyTimelineMotion,
	entryMatchesTech,
	initTimelineMotion,
} from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import { Fragment, useEffect, useMemo, useRef } from 'react';
import { FilterBar } from '../components/timeline/FilterBar';
import { TimelineEntry } from '../components/timeline/TimelineEntry';
import { useSyncTechFilterWithUrl, useTechFilter } from '../hooks/useTechFilter';

const data = timelineData as TimelineData;
const page = pageData as TimelinePageCopy;

export function Timeline() {
	const rootRef = useRef<HTMLElement>(null);
	const { active } = useTechFilter();
	useSyncTechFilterWithUrl();

	const matchCount = useMemo(
		() => data.entries.filter((e) => entryMatchesTech(e, active)).length,
		[active],
	);
	const filtering = active.size > 0;

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

			<div className={styles['page-head']}>
				<p className="section-label">{page.label}</p>
				<h1 className="section-title">{page.title}</h1>
				<p className={styles.intro}>{page.intro}</p>
			</div>

			<div className={styles.timeline} data-filtering={filtering ? 'true' : undefined}>
				<FilterBar matchCount={matchCount} total={data.entries.length} />

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
