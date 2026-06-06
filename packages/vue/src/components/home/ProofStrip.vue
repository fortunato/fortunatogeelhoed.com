<template>
	<section :class="styles.proof">
		<div class="container" :class="styles['proof-body']">
			<p class="section-label">Proof</p>
			<div :class="styles['proof-grid']">
				<div v-for="point in proof" :key="point.label" data-reveal>
					<p :class="styles['proof-metric']">{{ point.metric }}</p>
					<p :class="styles['proof-label']">{{ point.label }}</p>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { ProofPoint } from '@fg/shared';
import styles from '@styles/components/proof.module.css';

defineProps<{ proof: ProofPoint[] }>();
</script>
