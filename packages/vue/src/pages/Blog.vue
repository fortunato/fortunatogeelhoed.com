<template>
	<section>
		<div class="container">
			<span class="section-label">Writing</span>
			<h2 class="section-title">{{ content?.title ?? 'Blog' }}</h2>
			<p style="color: var(--text-secondary)">{{ content?.body ?? 'Blog posts will be loaded from the content pipeline.' }}</p>
		</div>
	</section>
</template>

<script setup lang="ts">
import { useContent } from '../composables/useContent';

const { content } = useContent('blog');
</script>
