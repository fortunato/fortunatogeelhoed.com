<template>
	<section :class="styles.page" ref="rootRef">
		<div hidden v-html="sprite" />

		<div :class="styles['page-head']">
			<p class="section-label">{{ page.label }}</p>
			<h1 class="section-title">{{ page.title }}</h1>
			<p :class="styles.intro">{{ page.intro }}</p>
		</div>

		<div :class="styles.timeline" :data-filtering="filtering ? 'true' : undefined">
			<FilterBar :match-count="matchCount" :total="total" />

			<div :class="styles['lane-headers']" aria-hidden="true">
				<div :class="styles['lane-header']" />
				<div v-for="lane in lanes" :key="lane" :class="styles['lane-header']">
					{{ laneLabels[lane] }}
				</div>
			</div>

			<template v-for="row in rows" :key="row.key">
				<div v-if="row.kind === 'era'" :class="styles.era" data-reveal>
					<span :class="styles['era-label']">{{ row.era }}</span>
				</div>
				<TimelineEntry v-else :entry="row.entry" />
			</template>
		</div>
	</section>
</template>

<script setup lang="ts">
import pageData from '@fg/content-data/timeline-page.json';
import timelineData from '@fg/content-data/timeline.json';
import type { TimelineEntry as TEntry, TimelineData, TimelinePageCopy } from '@fg/shared';
import {
	LANES,
	LANE_LABELS,
	TECH_SPRITE,
	destroyTimelineMotion,
	entryMatchesTech,
	initTimelineMotion,
} from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import FilterBar from '../components/timeline/FilterBar.vue';
import TimelineEntry from '../components/timeline/TimelineEntry.vue';
import { useTechFilter, useTechFilterSync } from '../composables/useTechFilter';

const data = timelineData as TimelineData;
const page = pageData as TimelinePageCopy;
const sprite = TECH_SPRITE;
const lanes = LANES;
const laneLabels = LANE_LABELS;
const rootRef = ref<HTMLElement | null>(null);
const total = data.entries.length;

const { active } = useTechFilter();
useTechFilterSync();
const filtering = computed(() => active.value.size > 0);
const matchCount = computed(
	() => data.entries.filter((e) => entryMatchesTech(e, active.value)).length,
);

type Row =
	| { kind: 'era'; era: string; key: string }
	| { kind: 'entry'; entry: TEntry; key: string };

const rows = computed<Row[]>(() => {
	const out: Row[] = [];
	let last = '';
	for (const entry of data.entries) {
		if (entry.era !== last) {
			out.push({ kind: 'era', era: entry.era, key: `era-${entry.era}` });
			last = entry.era;
		}
		out.push({ kind: 'entry', entry, key: entry.id });
	}
	return out;
});

onMounted(() => {
	if (rootRef.value) initTimelineMotion(rootRef.value);
});
onUnmounted(() => {
	destroyTimelineMotion();
});
</script>
