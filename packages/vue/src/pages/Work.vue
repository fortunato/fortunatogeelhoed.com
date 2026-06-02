<template>
	<section>
		<div class="container">
			<span class="section-label">Selected Work</span>
			<h2 class="section-title">{{ content?.title ?? 'Case Studies' }}</h2>
			<p style="color: var(--jb-text-secondary)">{{ content?.body ?? 'Work page content will be loaded from the content pipeline.' }}</p>
		</div>
	</section>
</template>

<script setup lang="ts">
import { useContent } from '../composables/useContent';

const { content } = useContent('work');
</script>
