<template>
	<section :class="styles.cta" aria-labelledby="cta-title">
		<div class="container">
			<div :class="styles['cta-panel']">
				<h2 :class="styles['cta-heading']" id="cta-title" data-reveal>{{ cta.heading }}</h2>
				<Button :to="cta.href" variant="inverted" tone="marketing">{{ cta.label }}</Button>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { HomeContent } from '@fg/shared';
import styles from '@styles/components/cta.module.css';
import Button from '../ui/Button.vue';

defineProps<{ cta: HomeContent['cta'] }>();
</script>
