<template>
	<div :class="styles['filter-bar']" :data-active="activeList.length ? 'true' : undefined">
		<template v-if="activeList.length">
			<span :class="styles['filter-bar-label']">Filtering by</span>
			<button
				v-for="name in activeList"
				:key="name"
				type="button"
				:class="styles['filter-chip']"
				:style="{ '--brand': v(name).brand }"
				:aria-label="`Remove ${name} filter`"
				@click="toggle(name)"
			>
				<svg v-if="v(name).icon" :class="styles['pill-icon']" aria-hidden="true">
					<use :href="`#i-${v(name).icon}`" />
				</svg>
				{{ name }}
				<svg :class="styles['filter-chip-x']" viewBox="0 0 16 16" aria-hidden="true">
					<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
			</button>
			<button type="button" :class="styles['filter-clear']" @click="clear">Clear all</button>
		</template>
		<span v-else :class="styles['filter-hint']">Select any technology to filter the timeline</span>
		<!-- Always mounted so the first activation (0 → 1) is announced: screen readers often skip
		     a live region inserted at the same moment as its text. -->
		<p :class="styles['filter-count']" aria-live="polite">
			{{ activeList.length ? `${matchCount} of ${total} roles match` : '' }}
		</p>
	</div>
</template>

<script setup lang="ts">
import { techVisual } from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import { computed } from 'vue';
import { useTechFilter } from '../../composables/useTechFilter';

defineProps<{ matchCount: number; total: number }>();

const { active, toggle, clear } = useTechFilter();
const activeList = computed(() => [...active.value]);
const v = techVisual;
</script>
