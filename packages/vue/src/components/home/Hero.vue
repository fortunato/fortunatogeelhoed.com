<template>
	<!-- data-hero marks this as the page that owns the staggered entrance; the shared motion
	     stylesheet suppresses the unified whole-main fade here and runs the [data-enter] stagger
	     instead. Both are gated on data-nav-enter, so they play after the smooth scroll. -->
	<section :class="styles.hero" data-hero>
		<div :class="styles['hero-wallpaper']" aria-hidden="true">
			<div v-for="i in wallpaperLines" :key="i" :class="styles['hero-wallpaper-line']">
				{{ wallpaperLine }}
			</div>
		</div>
		<div :class="styles['hero-glow']" aria-hidden="true" />
		<div :class="[styles['hero-content'], 'container']">
			<p class="section-label" data-enter="1">{{ hero.tagline }}</p>
			<h1 :class="styles['hero-name']" data-enter="2">{{ hero.name }}</h1>
			<div :class="styles['hero-dots']" aria-hidden="true" data-enter="3">
				<span /><span /><span />
			</div>
			<p :class="styles['hero-statement']" data-enter="4">{{ hero.statement }}</p>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { HomeContent } from '@fg/shared';
import styles from '@styles/components/hero.module.css';

defineProps<{ hero: HomeContent['hero'] }>();

const wallpaperLine = 'FORTUNATO.GEELHOED  '.repeat(6);
// Enough lines that the rotated band overflows the 300%-tall container and fills the
// corners (the .hero clips the overflow). Too few leaves the top/bottom corners bare.
const wallpaperLines = Array.from({ length: 40 }, (_, i) => i);
</script>
