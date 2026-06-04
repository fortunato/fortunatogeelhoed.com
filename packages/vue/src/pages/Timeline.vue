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

		<FrameworkRibbon :data="data" />

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

			<TimelineEntry v-for="entry in data.entries" :key="entry.id" :entry="entry" />
		</div>
	</section>
</template>

<script setup lang="ts">
import type { TimelineData } from '@fg/shared';
import { destroySmoothScroll, initSmoothScroll } from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import { onMounted, onUnmounted } from 'vue';
import timelineData from '../../../content/timeline.json';
import FrameworkRibbon from '../components/timeline/FrameworkRibbon.vue';
import TimelineEntry from '../components/timeline/TimelineEntry.vue';

const data = timelineData as TimelineData;

onMounted(() => {
	initSmoothScroll();
});
onUnmounted(() => {
	destroySmoothScroll();
});
</script>
