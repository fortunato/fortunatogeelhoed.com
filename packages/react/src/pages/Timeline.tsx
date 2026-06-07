import timelineData from '@fg/content-data/timeline.json';
import type { TimelineData } from '@fg/shared';
import { TECH_SPRITE, destroyTimelineMotion, initTimelineMotion } from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import { Fragment, useEffect, useRef } from 'react';
import { TimelineEntry } from '../components/timeline/TimelineEntry';

const data = timelineData as TimelineData;

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
				<p className="section-label">Career</p>
				<h1 className="section-title">Twenty-five years across the stack</h1>
				<p className={styles.intro}>
					From classic ASP and Flash to React, NestJS and agentic workflows: a working
					life across the frontend, backend, infrastructure and, lately, AI. In the 2010s
					I was the frontend specialist teams reached for when the UI had to be right;
					that's where today's React, Angular and Vue depth comes from, and the 2020s
					broadened it back to full-stack and lead. Across every title, engineer to
					manager, at least half my time has stayed in the code.
				</p>
			</div>

			<div className={styles.timeline}>
				<div className={styles['lane-headers']} aria-hidden="true">
					<div className={styles['lane-header']} />
					<div className={styles['lane-header']}>Frontend</div>
					<div className={styles['lane-header']}>Backend / DB</div>
					<div className={styles['lane-header']}>CI/CD &amp; Infra</div>
					<div className={styles['lane-header']}>AI / LLM</div>
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
