<template>
	<article
		:class="styles.entry"
		:data-side="entry.isSideProject ? 'true' : null"
		data-reveal
	>
		<template v-for="lane in leftLanes" :key="lane.key">
			<div
				v-if="entry.tech[lane.key]?.length"
				:class="[styles.lane, styles[lane.cls]]"
				:data-lane-label="laneLabels[lane.key]"
			>
				<span v-for="t in entry.tech[lane.key]" :key="t" class="tech-tag">{{ t }}</span>
			</div>
		</template>

		<div :class="styles.spine">
			<span :class="styles['year-node']" :data-emp="entry.employmentType">
				{{ entry.startYear }}
			</span>
		</div>

		<div :class="styles.role">
			<p :class="styles['role-period']">{{ period(entry) }}</p>
			<p :class="styles['role-title']">{{ entry.role }}</p>
			<p :class="styles['role-org']">{{ entry.organization }}</p>
			<p v-if="entry.summary" :class="styles['role-summary']">{{ entry.summary }}</p>
			<span v-if="entry.isSideProject" :class="styles['role-badge']">Side project</span>
		</div>

		<div
			v-if="entry.tech.frontend?.length"
			:class="[styles.lane, styles['lane-fe']]"
			data-lane-label="Frontend"
		>
			<span v-for="t in entry.tech.frontend" :key="t" class="tech-tag">{{ t }}</span>
		</div>
	</article>
</template>

<script setup lang="ts">
import type { Lane, TimelineEntry } from '@fg/shared';
import { LANE_LABELS } from '@fg/shared';
import styles from '@styles/components/timeline.module.css';

defineProps<{ entry: TimelineEntry }>();

const laneLabels = LANE_LABELS;
const leftLanes: { key: Lane; cls: string }[] = [
	{ key: 'ai-llm', cls: 'lane-ai' },
	{ key: 'ci-cd', cls: 'lane-cicd' },
	{ key: 'database', cls: 'lane-db' },
	{ key: 'backend', cls: 'lane-be' },
];

function period(entry: TimelineEntry): string {
	if (entry.endYear === 'present') return `${entry.startYear}–now`;
	return entry.endYear === entry.startYear
		? `${entry.startYear}`
		: `${entry.startYear}–${entry.endYear}`;
}
</script>
