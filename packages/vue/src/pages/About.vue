<template>
	<section>
		<div class="container">
			<span class="section-label">About</span>
			<h2 class="section-title">{{ content?.title ?? 'Fortunato Geelhoed' }}</h2>
			<p style="color: var(--text-secondary)">{{ content?.body ?? 'About page content will be loaded from the content pipeline.' }}</p>
		</div>
	</section>
</template>

<script setup lang="ts">
import { useContent } from '../composables/useContent'

const { content } = useContent('about')
</script>
