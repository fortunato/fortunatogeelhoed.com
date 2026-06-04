<template>
	<section :class="styles.cta">
		<div class="container">
			<h2 :class="styles['cta-heading']" data-reveal>{{ cta.heading }}</h2>
			<RouterLink :to="cta.href" class="btn">Get in touch</RouterLink>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { HomeContent } from '@fg/shared';
import styles from '@styles/components/home.module.css';
import { RouterLink } from 'vue-router';

defineProps<{ cta: HomeContent['cta'] }>();
</script>
