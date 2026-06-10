<template>
	<div :class="styles.ribbon">
		<p :class="styles['ribbon-title']">{{ title }}</p>
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
		<ul :class="styles['ribbon-rows']">
			<li v-for="row in rows" :key="row.framework" :class="styles['ribbon-row']">
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
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import type { AxisTick, RibbonRow, RibbonSegment } from '@fg/shared';
import styles from '@styles/components/framework-ribbon.module.css';

defineProps<{ title: string; rows: RibbonRow[]; ticks: AxisTick[] }>();

function segStyle(seg: RibbonSegment): Record<string, string> {
	return seg.intensity !== 'brief'
		? { left: `${seg.left}%`, width: `${seg.width}%` }
		: { left: `${seg.left}%` };
}
</script>
