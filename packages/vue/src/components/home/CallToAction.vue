<template>
	<section :class="styles.cta">
		<div class="container">
			<div :class="styles['cta-panel']">
				<h2 :class="styles['cta-heading']" data-reveal>{{ cta.heading }}</h2>
				<RouterLink :to="cta.href" :class="['btn', styles['cta-btn']]">Get in touch</RouterLink>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { HomeContent } from '@fg/shared';
import styles from '@styles/components/cta.module.css';
import { RouterLink } from 'vue-router';

defineProps<{ cta: HomeContent['cta'] }>();
</script>
