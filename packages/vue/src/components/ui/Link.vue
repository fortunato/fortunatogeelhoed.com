<template>
	<component :is="tag" :class="classes" v-bind="elementAttrs">
		<slot />
	</component>
</template>

<script setup lang="ts">
// Text-first link. `inline` for prose; `arrow` adds the CSS-drawn chevron that nudges on hover.
// Look lives in `.link*` (styles/base.css).
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

type Variant = 'inline' | 'arrow';

const props = withDefaults(
	defineProps<{
		variant?: Variant;
		to?: string;
		href?: string;
	}>(),
	{ variant: 'inline', to: undefined, href: undefined },
);

const tag = computed(() => (props.to ? RouterLink : 'a'));

const elementAttrs = computed(() => (props.to ? { to: props.to } : { href: props.href }));

const classes = computed(() =>
	['link', props.variant === 'arrow' ? 'link--arrow' : ''].filter(Boolean).join(' '),
);
</script>
