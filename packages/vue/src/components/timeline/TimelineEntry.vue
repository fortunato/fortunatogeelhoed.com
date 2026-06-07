<template>
	<article :class="styles.entry" :data-type="entry.type" data-reveal>
		<div :class="styles.spine">
			<div :class="styles['spine-years']">{{ entry.years }}</div>
			<div :class="styles['spine-client']">{{ entry.client }}</div>
			<div :class="styles['spine-role']">{{ entry.role }}</div>
			<span :class="styles['spine-type']" :data-type="entry.type">
				<svg v-if="entry.type === 'side-project'" :class="styles['type-icon']">
					<use href="#i-branch" />
				</svg>
				{{ typeLabel[entry.type] }}
			</span>
			<div v-for="h in highlights" :key="h" :class="styles['spine-highlight']">{{ h }}</div>
		</div>

		<template v-for="lane in lanes" :key="lane.key">
			<div
				v-if="entry.tech[lane.key]?.length"
				:class="[styles.lane, styles[lane.cls]]"
				:data-lane-label="laneLabels[lane.key]"
			>
				<span
					v-for="t in entry.tech[lane.key]"
					:key="t"
					:class="styles.pill"
					:style="{ '--brand': v(t).brand }"
				>
					<svg v-if="v(t).icon" :class="styles['pill-icon']"><use :href="`#i-${v(t).icon}`" /></svg>
					{{ t }}
				</span>
			</div>
		</template>
	</article>
</template>

<script setup lang="ts">
import type { Lane, TimelineEntry } from '@fg/shared';
import { EMPLOYMENT_TYPE_LABELS, LANE_LABELS, techVisual } from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import { computed } from 'vue';

const props = defineProps<{ entry: TimelineEntry }>();

const highlights = computed<string[]>(() => {
	const h = props.entry.highlight;
	return h ? (Array.isArray(h) ? h : [h]) : [];
});

const laneLabels = LANE_LABELS;
const v = techVisual;
const lanes: { key: Lane; cls: string }[] = [
	{ key: 'frontend', cls: 'lane-fe' },
	{ key: 'backend', cls: 'lane-be' },
	{ key: 'cicd', cls: 'lane-ci' },
	{ key: 'ai', cls: 'lane-ai' },
];
const typeLabel = EMPLOYMENT_TYPE_LABELS;
</script>
