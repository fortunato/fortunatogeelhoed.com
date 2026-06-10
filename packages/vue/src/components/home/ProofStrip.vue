<template>
	<section data-band :aria-label="copy.label">
		<div class="container" :class="styles['proof-body']">
			<p class="section-label">{{ copy.label }}</p>
			<dl :class="styles['proof-grid']">
				<div v-for="point in proof" :key="point.label" :class="styles['proof-item']" data-reveal>
					<dt :class="styles['proof-label']">{{ point.label }}</dt>
					<dd :class="styles['proof-metric']">{{ point.metric }}</dd>
				</div>
			</dl>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { HomeContent, ProofPoint } from '@fg/shared';
import styles from '@styles/components/proof.module.css';

defineProps<{ proof: ProofPoint[]; copy: HomeContent['sections']['proof'] }>();
</script>
