import type { TimelineData } from '@fg/shared';
import { destroySmoothScroll, initSmoothScroll } from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import { useEffect } from 'react';
import timelineData from '../../../content/timeline.json';
import { FrameworkRibbon } from '../components/timeline/FrameworkRibbon';
import { TimelineEntry } from '../components/timeline/TimelineEntry';

const data = timelineData as TimelineData;

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

			<FrameworkRibbon data={data} />

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
					<TimelineEntry key={entry.id} entry={entry} />
				))}
			</div>
		</section>
	);
}
