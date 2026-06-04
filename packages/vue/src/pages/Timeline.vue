<template>
	<section :class="styles.page">
		<div class="container">
			<p class="section-label">Career</p>
			<h1 class="section-title">Twenty-five years, five lanes</h1>
			<p :class="styles.intro">
				From classic ASP and Flash to React, NestJS and agentic workflows — a working life across
				the frontend, backend, infrastructure and, lately, AI. Frameworks deepen, the AI lane fills
				in, and a trading system runs quietly alongside it all.
			</p>
		</div>

		<div :class="[styles.ribbon, 'container']">
			<p :class="styles['ribbon-title']">Framework exposure</p>
			<div v-for="row in rows" :key="row.framework" :class="styles['ribbon-row']">
				<span :class="styles['ribbon-label']">{{ row.framework }}</span>
				<div :class="styles['ribbon-track']">
					<span
						v-for="(seg, i) in row.segments"
						:key="i"
						:class="styles['ribbon-seg']"
						:data-intensity="seg.intensity"
						:style="segStyle(seg)"
					/>
				</div>
			</div>
			<div :class="styles['ribbon-axis']">
				<span
					v-for="tick in ticks"
					:key="tick.year"
					:class="styles['ribbon-tick']"
					:style="{ left: `${tick.left}%` }"
				>
					{{ tick.year }}
				</span>
			</div>
			<div :class="styles['ribbon-legend']">
				<span v-for="item in intensityLegend" :key="item.intensity" :class="styles['legend-item']">
					<span :class="styles['legend-swatch']" :data-intensity="item.intensity" />
					{{ item.label }}
				</span>
			</div>
		</div>

		<div :class="styles.timeline">
			<div :class="styles['lane-labels']" aria-hidden="true">
				<span :class="styles['lane-head']" data-side="left">AI / LLM</span>
				<span :class="styles['lane-head']" data-side="left">CI / CD</span>
				<span :class="styles['lane-head']" data-side="left">Database</span>
				<span :class="styles['lane-head']" data-side="left">Backend</span>
				<span :class="styles['lane-head']">Year</span>
				<span :class="styles['lane-head']">Role</span>
				<span :class="styles['lane-head']">Frontend</span>
			</div>

			<article
				v-for="entry in data.entries"
				:key="entry.id"
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
		</div>
	</section>
</template>

<script setup lang="ts">
import type { Lane, RibbonSegment, TimelineData, TimelineEntry } from '@fg/shared';
import {
	LANE_LABELS,
	axisTicks,
	destroySmoothScroll,
	initSmoothScroll,
	ribbonRows,
} from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import { onMounted, onUnmounted } from 'vue';
import timelineData from '../../../content/timeline.json';

const data = timelineData as TimelineData;
const rows = ribbonRows(data);
const ticks = axisTicks(data);
const laneLabels = LANE_LABELS;

const leftLanes: { key: Lane; cls: string }[] = [
	{ key: 'ai-llm', cls: 'lane-ai' },
	{ key: 'ci-cd', cls: 'lane-cicd' },
	{ key: 'database', cls: 'lane-db' },
	{ key: 'backend', cls: 'lane-be' },
];

const intensityLegend = [
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

function segStyle(seg: RibbonSegment): Record<string, string> {
	return seg.intensity !== 'brief'
		? { left: `${seg.left}%`, width: `${seg.width}%` }
		: { left: `${seg.left}%` };
}

onMounted(() => {
	initSmoothScroll();
});
onUnmounted(() => {
	destroySmoothScroll();
});
</script>
