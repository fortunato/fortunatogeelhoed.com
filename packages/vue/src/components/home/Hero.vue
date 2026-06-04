<template>
	<section :class="styles.hero">
		<div :class="styles['hero-wallpaper']" aria-hidden="true">
			<div v-for="i in wallpaperLines" :key="i" :class="styles['hero-wallpaper-line']">
				{{ wallpaperLine }}
			</div>
		</div>
		<div :class="[styles['hero-content'], 'container']">
			<p class="section-label" data-enter="1">{{ hero.tagline }}</p>
			<h1 :class="styles['hero-name']" data-enter="2">{{ hero.name }}</h1>
			<p :class="styles['hero-statement']" data-enter="3">{{ hero.statement }}</p>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { HomeContent } from '@fg/shared';
import styles from '@styles/components/home.module.css';

defineProps<{ hero: HomeContent['hero'] }>();

const wallpaperLine = 'FORTUNATO.GEELHOED  '.repeat(6);
const wallpaperLines = Array.from({ length: 14 }, (_, i) => i);
</script>
