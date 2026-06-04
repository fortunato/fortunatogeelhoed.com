<template>
	<section>
		<div class="container">
			<span class="section-label">Writing</span>
			<h1 class="section-title">{{ content?.title ?? 'Blog' }}</h1>
			<p style="color: var(--jb-text-secondary)">{{ content?.body ?? 'Blog posts will be loaded from the content pipeline.' }}</p>
		</div>
	</section>
</template>

<script setup lang="ts">
import { useContent } from '../composables/useContent';

const { content } = useContent('blog');
</script>
