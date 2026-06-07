<template>
	<section :class="styles.page" ref="rootRef">
		<div hidden v-html="sprite" />

		<div class="container">
			<p class="section-label">Career</p>
			<h1 class="section-title">Twenty-five years across the stack</h1>
			<p :class="styles.intro">
				From classic ASP and Flash to React, NestJS and agentic workflows: a working life across the frontend, backend, infrastructure and, lately, AI. In the 2010s I was the frontend specialist teams reached for when the UI had to be right; that's where today's React, Angular and Vue depth comes from, and the 2020s broadened it back to full-stack and lead. Across every title, engineer to manager, at least half my time has stayed in the code.
			</p>
		</div>

		<div :class="styles.timeline">
			<div :class="styles['lane-headers']" aria-hidden="true">
				<div :class="styles['lane-header']" />
				<div :class="styles['lane-header']">Frontend</div>
				<div :class="styles['lane-header']">Backend / DB</div>
				<div :class="styles['lane-header']">CI/CD &amp; Infra</div>
				<div :class="styles['lane-header']">AI / LLM</div>
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
import timelineData from '@fg/content-data/timeline.json';
import type { TimelineEntry as TEntry, TimelineData } from '@fg/shared';
import { TECH_SPRITE, destroyTimelineMotion, initTimelineMotion } from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import TimelineEntry from '../components/timeline/TimelineEntry.vue';

const data = timelineData as TimelineData;
const sprite = TECH_SPRITE;
const rootRef = ref<HTMLElement | null>(null);

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
