<template>
	<article
		:class="styles.entry"
		:data-type="entry.type"
		:data-dimmed="dimmed ? 'true' : undefined"
		data-reveal
	>
		<div :class="styles.spine">
			<div :class="styles['spine-years']">{{ entry.years }}</div>
			<div :class="styles['spine-client']">{{ entry.client }}</div>
			<div :class="styles['spine-role']">{{ entry.role }}</div>
			<div :class="styles['spine-badges']">
				<span class="tag tag--status" :data-kind="entry.type">
					<svg v-if="entry.type === 'side-project'" :class="styles['type-icon']" aria-hidden="true">
						<use href="#i-branch" />
					</svg>
					{{ typeLabel[entry.type] }}
				</span>
				<span v-if="entry.agency" class="tag tag--neutral">{{ agencyLabel }}</span>
			</div>
			<div v-if="entry.domains?.length" :class="styles['spine-domains']">
				<span v-for="d in entry.domains" :key="d" class="tag tag--neutral">{{ d }}</span>
			</div>
			<div v-for="h in highlights" :key="h" :class="styles['spine-highlight']">{{ h }}</div>
			<div v-if="entry.links?.length" :class="styles['spine-links']">
				<template v-for="l in entry.links" :key="l.href">
					<Button
						v-if="isExternal(l.href)"
						size="sm"
						variant="secondary"
						:href="l.href"
						:icon="l.icon"
						target="_blank"
						rel="noopener noreferrer"
						:title="l.title"
						:aria-label="`${l.title ?? l.label} (opens in a new tab)`"
					>
						{{ l.label }}
					</Button>
					<Button v-else size="sm" :to="l.href" :icon="l.icon" :title="l.title">
						{{ l.label }}
					</Button>
				</template>
			</div>
		</div>

		<template v-for="lane in lanes" :key="lane.key">
			<div
				v-if="entry.tech[lane.key]?.length"
				:class="[styles.lane, styles[lane.cls]]"
				:data-lane-label="laneLabels[lane.key]"
			>
				<button
					v-for="t in entry.tech[lane.key]"
					:key="t"
					type="button"
					:class="styles.pill"
					:style="{ '--brand': v(t).brand }"
					:aria-pressed="isActive(t)"
					:aria-label="`Filter by ${t}`"
					@click="toggle(t)"
				>
					<svg v-if="v(t).icon" :class="styles['pill-icon']" aria-hidden="true">
						<use :href="`#i-${v(t).icon}`" />
					</svg>
					{{ t }}
				</button>
			</div>
		</template>
	</article>
</template>

<script setup lang="ts">
import type { Lane, TimelineEntry } from '@fg/shared';
import {
	AGENCY_LABEL,
	EMPLOYMENT_TYPE_LABELS,
	LANE_LABELS,
	entryMatchesTech,
	isExternalHref,
	techVisual,
} from '@fg/shared';
import styles from '@styles/components/timeline.module.css';
import { computed } from 'vue';
import { useTechFilter } from '../../composables/useTechFilter';
import Button from '../ui/Button.vue';

const props = defineProps<{ entry: TimelineEntry }>();

const { active, isActive, toggle } = useTechFilter();
const dimmed = computed(
	() => active.value.size > 0 && !entryMatchesTech(props.entry, active.value),
);

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
const agencyLabel = AGENCY_LABEL;
const isExternal = isExternalHref;
</script>
