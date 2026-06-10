<template>
	<section data-band>
		<div class="container" :class="styles['approach-body']">
			<p class="section-label">{{ copy.label }}</p>
			<h2 class="section-title">{{ copy.title }}</h2>
			<div :class="styles['approach-grid']">
				<article
					v-for="principle in principles"
					:key="principle.title"
					:class="styles.principle"
					data-reveal
				>
					<h3 :class="styles['principle-title']">{{ principle.title }}</h3>
					<p :class="styles['principle-desc']">{{ principle.description }}</p>
				</article>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { HomeContent, Principle } from '@fg/shared';
import styles from '@styles/components/approach.module.css';

defineProps<{ principles: Principle[]; copy: HomeContent['sections']['approach'] }>();
</script>
