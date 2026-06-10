<template>
	<component :is="tag" :class="classes" v-bind="elementAttrs">
		<jb-icon v-if="icon" :name="icon" />
		<slot />
	</component>
</template>

<script setup lang="ts">
// The shared action primitive. <component :is> resolves to the element the usage needs — a
// router link, an external anchor, or a real button — while the look is owned by the global
// `.btn` classes (styles/base.css). Three orthogonal axes: variant repaints, size is geometry,
// tone is casing (sentence-case default; "marketing" is the loud uppercase CTA treatment). Extra
// attributes (type, target, rel, aria-*, disabled) fall through to the resolved element.
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

type Variant = 'primary' | 'inverted' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';
type Tone = 'plain' | 'marketing';

const props = withDefaults(
	defineProps<{
		variant?: Variant;
		size?: Size;
		/** Casing. Defaults to sentence-case; "marketing" is the loud uppercase CTA treatment. */
		tone?: Tone;
		/** Optional leading glyph (e.g. "github"), rendered via the shared jb-icon element. */
		icon?: string;
		/** Internal route — renders a RouterLink. */
		to?: string;
		/** External URL — renders an anchor. */
		href?: string;
	}>(),
	{
		variant: 'primary',
		size: 'md',
		tone: 'plain',
		icon: undefined,
		to: undefined,
		href: undefined,
	},
);

const VARIANT_CLASS: Record<Variant, string> = {
	primary: '',
	inverted: 'btn--inverted',
	secondary: 'btn--secondary',
	ghost: 'btn--ghost',
};

const tag = computed(() => (props.to ? RouterLink : props.href ? 'a' : 'button'));

const elementAttrs = computed(() =>
	props.to ? { to: props.to } : props.href ? { href: props.href } : {},
);

const classes = computed(() =>
	[
		'btn',
		VARIANT_CLASS[props.variant],
		props.size === 'sm' ? 'btn--sm' : '',
		props.tone === 'marketing' ? 'btn--marketing' : '',
	]
		.filter(Boolean)
		.join(' '),
);
</script>
