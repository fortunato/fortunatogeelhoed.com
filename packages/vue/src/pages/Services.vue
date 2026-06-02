<template>
	<section>
		<div class="container">
			<span class="section-label">What I Do</span>
			<h2 class="section-title">{{ content?.title ?? 'Services' }}</h2>
			<p style="color: var(--text-secondary)">{{ content?.body ?? 'Services page content will be loaded from the content pipeline.' }}</p>
		</div>
	</section>
</template>

<script setup lang="ts">
import { useContent } from '../composables/useContent';

const { content } = useContent('services');
</script>
