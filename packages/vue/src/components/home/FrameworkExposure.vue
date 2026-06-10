<template>
	<section>
		<div class="container" :class="styles['exposure-body']">
			<p class="section-label">{{ copy.label }}</p>
			<h2 :class="['section-title', styles.head]">{{ copy.title }}</h2>
			<p :class="styles.intro">{{ copy.intro }}</p>
			<FrameworkRibbon title="Frontend Frameworks" :rows="frontendRows" :ticks="ticks" />
			<FrameworkRibbon title="Backend &amp; CMS" :rows="backendRows" :ticks="ticks" />
			<div :class="styles['ribbon-legend']">
				<span v-for="item in intensityLegend" :key="item.intensity" :class="styles['legend-item']">
					<span :class="styles['legend-swatch']" :data-intensity="item.intensity" />
					{{ item.label }}
				</span>
			</div>
			<RouterLink :to="copy.link.href" :class="styles['exposure-link']">{{ copy.link.label }}</RouterLink>
		</div>
	</section>
</template>

<script setup lang="ts">
import backend from '@fg/content-data/backend-frameworks.json';
import frontend from '@fg/content-data/frontend-frameworks.json';
import type { FrameworkExposureSpan, HomeContent } from '@fg/shared';
import { INTENSITY_LEGEND, axisTicks, ribbonRows, spansBounds } from '@fg/shared';
import styles from '@styles/components/framework-ribbon.module.css';
import { RouterLink } from 'vue-router';
import FrameworkRibbon from '../timeline/FrameworkRibbon.vue';

defineProps<{ copy: HomeContent['sections']['frameworks'] }>();

const frontendFrameworks = frontend as FrameworkExposureSpan[];
const backendFrameworks = backend as FrameworkExposureSpan[];

// Both ribbons share one axis so their years line up.
const bounds = spansBounds(frontendFrameworks, backendFrameworks);
const frontendRows = ribbonRows(frontendFrameworks, bounds);
const backendRows = ribbonRows(backendFrameworks, bounds);
const ticks = axisTicks(bounds);

const intensityLegend = INTENSITY_LEGEND;
</script>
