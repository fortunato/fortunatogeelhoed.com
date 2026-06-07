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
				<span :class="styles['spine-type']" :data-type="entry.type">
					<svg v-if="entry.type === 'side-project'" :class="styles['type-icon']" aria-hidden="true">
						<use href="#i-branch" />
					</svg>
					{{ typeLabel[entry.type] }}
				</span>
				<span v-if="entry.agency" :class="styles['spine-agency']">{{ agencyLabel }}</span>
			</div>
			<div v-if="entry.domains?.length" :class="styles['spine-domains']">
				<span v-for="d in entry.domains" :key="d" :class="styles.domain">{{ d }}</span>
			</div>
			<div v-for="h in highlights" :key="h" :class="styles['spine-highlight']">{{ h }}</div>
			<div v-if="entry.links?.length" :class="styles['spine-links']">
				<template v-for="l in entry.links" :key="l.href">
					<a
						v-if="isExternal(l.href)"
						:href="l.href"
						:class="[styles['spine-link'], styles['spine-link-external']]"
						target="_blank"
						rel="noopener noreferrer"
						:title="l.title"
						:aria-label="`${l.title ?? l.label} (opens in a new tab)`"
					>
						<jb-icon v-if="l.icon" :name="l.icon" />
						{{ l.label }}
					</a>
					<RouterLink v-else :to="l.href" :class="styles['spine-link']" :title="l.title">
						<jb-icon v-if="l.icon" :name="l.icon" />
						{{ l.label }}
					</RouterLink>
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
import { RouterLink } from 'vue-router';
import { useTechFilter } from '../../composables/useTechFilter';

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
