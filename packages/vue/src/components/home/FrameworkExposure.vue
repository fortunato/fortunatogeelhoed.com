<template>
	<section>
		<div class="container">
			<p class="section-label">Frameworks</p>
			<h2 :class="['section-title', styles.head]">
				Frameworks come and go. The craft compounds.
			</h2>
			<p :class="styles.intro">
				Twenty-five years on the web means living through every frontend era and the backends
				beneath it — and staying fluent while the stack reinvents itself.
			</p>
			<FrameworkRibbon title="Frontend Frameworks" :rows="frontendRows" :ticks="ticks" />
			<FrameworkRibbon title="Backend &amp; CMS" :rows="backendRows" :ticks="ticks" />
			<div :class="styles['ribbon-legend']">
				<span v-for="item in intensityLegend" :key="item.intensity" :class="styles['legend-item']">
					<span :class="styles['legend-swatch']" :data-intensity="item.intensity" />
					{{ item.label }}
				</span>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { FrameworkExposureSpan } from '@fg/shared';
import { axisTicks, ribbonRows, spansBounds } from '@fg/shared';
import styles from '@styles/components/framework-ribbon.module.css';
import backend from '../../../../content/backend-frameworks.json';
import frontend from '../../../../content/frontend-frameworks.json';
import FrameworkRibbon from '../timeline/FrameworkRibbon.vue';

const frontendFrameworks = frontend as FrameworkExposureSpan[];
const backendFrameworks = backend as FrameworkExposureSpan[];

// Both ribbons share one axis so their years line up.
const bounds = spansBounds(frontendFrameworks, backendFrameworks);
const frontendRows = ribbonRows(frontendFrameworks, bounds);
const backendRows = ribbonRows(backendFrameworks, bounds);
const ticks = axisTicks(bounds);

const intensityLegend = [
	{ intensity: 'professional', label: 'Professional / daily' },
	{ intensity: 'occasional', label: 'Occasional' },
	{ intensity: 'brief', label: 'Brief' },
];
</script>
