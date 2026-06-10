<template>
	<section data-band aria-labelledby="approach-title">
		<div class="container" :class="styles['approach-body']">
			<p class="section-label">{{ copy.label }}</p>
			<h2 class="section-title" id="approach-title">{{ copy.title }}</h2>
			<ul :class="styles['approach-grid']">
				<li
					v-for="principle in principles"
					:key="principle.title"
					:class="styles.principle"
					data-reveal
				>
					<h3 :class="styles['principle-title']">{{ principle.title }}</h3>
					<p :class="styles['principle-desc']">{{ principle.description }}</p>
				</li>
			</ul>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { HomeContent, Principle } from '@fg/shared';
import styles from '@styles/components/approach.module.css';

defineProps<{ principles: Principle[]; copy: HomeContent['sections']['approach'] }>();
</script>
