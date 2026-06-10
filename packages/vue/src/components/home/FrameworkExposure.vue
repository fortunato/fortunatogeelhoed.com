<template>
	<section aria-labelledby="frameworks-title">
		<div class="container" :class="styles['exposure-body']">
			<p class="section-label">{{ copy.label }}</p>
			<h2 :class="['section-title', styles.head]" id="frameworks-title">{{ copy.title }}</h2>
			<p :class="styles.intro">{{ copy.intro }}</p>
			<FrameworkRibbon title="Frontend Frameworks" :rows="frontendRows" :ticks="ticks" />
			<FrameworkRibbon title="Backend & CMS" :rows="backendRows" :ticks="ticks" />
			<ul :class="styles['ribbon-legend']">
				<li v-for="item in intensityLegend" :key="item.intensity" :class="styles['legend-item']">
					<span :class="styles['legend-swatch']" :data-intensity="item.intensity" />
					{{ item.label }}
				</li>
			</ul>
			<Link :to="copy.link.href" variant="arrow" :class="styles['exposure-link']">{{ copy.link.label }}</Link>
		</div>
	</section>
</template>

<script setup lang="ts">
import backend from '@fg/content-data/backend-frameworks.json';
import frontend from '@fg/content-data/frontend-frameworks.json';
import type { FrameworkExposureSpan, HomeContent } from '@fg/shared';
import { INTENSITY_LEGEND, axisTicks, ribbonRows, spansBounds } from '@fg/shared';
import styles from '@styles/components/framework-ribbon.module.css';
import FrameworkRibbon from '../timeline/FrameworkRibbon.vue';
import Link from '../ui/Link.vue';

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
