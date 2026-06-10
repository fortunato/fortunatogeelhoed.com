<template>
	<section aria-labelledby="services-title">
		<div class="container" :class="styles['services-body']">
			<p class="section-label">{{ copy.label }}</p>
			<h2 class="section-title" id="services-title">{{ copy.title }}</h2>
			<ul :class="styles['services-grid']" ref="gridRef">
				<li
					v-for="(service, i) in services"
					:key="service.title"
					:class="styles['service-card']"
					data-reveal
					data-spotlight
				>
					<span :class="styles['service-index']">{{ String(i + 1).padStart(2, '0') }}</span>
					<h3 :class="styles['service-title']">{{ service.title }}</h3>
					<p :class="styles['service-desc']">{{ service.description }}</p>
				</li>
			</ul>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { HomeContent, ServiceOffering } from '@fg/shared';
import { initCardSpotlight } from '@fg/shared';
import styles from '@styles/components/services.module.css';
import { onMounted, onUnmounted, ref } from 'vue';

defineProps<{ services: ServiceOffering[]; copy: HomeContent['sections']['services'] }>();

const gridRef = ref<HTMLElement | null>(null);
let cleanup = () => {};
onMounted(() => {
	if (gridRef.value) cleanup = initCardSpotlight(gridRef.value);
});
onUnmounted(() => cleanup());
</script>
