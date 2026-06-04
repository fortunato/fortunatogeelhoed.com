<template>
	<section>
		<div class="container">
			<p class="section-label">What I do</p>
			<h2 class="section-title">Services</h2>
			<div :class="styles['services-grid']">
				<article v-for="service in services" :key="service.title" class="card" data-reveal>
					<h3 :class="styles['service-title']">{{ service.title }}</h3>
					<p :class="styles['service-desc']">{{ service.description }}</p>
				</article>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { ServiceOffering } from '@fg/shared';
import styles from '@styles/components/home.module.css';

defineProps<{ services: ServiceOffering[] }>();
</script>
