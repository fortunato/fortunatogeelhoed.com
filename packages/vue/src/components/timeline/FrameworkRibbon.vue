<template>
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
</template>

<script setup lang="ts">
import type { RibbonSegment, TimelineData } from '@fg/shared';
import { axisTicks, ribbonRows } from '@fg/shared';
import styles from '@styles/components/timeline.module.css';

const props = defineProps<{ data: TimelineData }>();

const rows = ribbonRows(props.data);
const ticks = axisTicks(props.data);

const intensityLegend = [
	{ intensity: 'professional', label: 'Professional / daily' },
	{ intensity: 'occasional', label: 'Side-project' },
	{ intensity: 'brief', label: 'Brief' },
];

function segStyle(seg: RibbonSegment): Record<string, string> {
	return seg.intensity !== 'brief'
		? { left: `${seg.left}%`, width: `${seg.width}%` }
		: { left: `${seg.left}%` };
}
</script>
