<template>
	<section>
		<div class="container">
			<span class="section-label">Available Now</span>
			<h2 class="section-title">{{ content?.title ?? "Let's work together." }}</h2>
			<p style="color: var(--text-secondary)">{{ content?.body ?? 'Get in touch for consulting, freelance projects, or collaboration.' }}</p>
		</div>
	</section>
</template>

<script setup lang="ts">
import { useContent } from '../composables/useContent'

const { content } = useContent('contact')
</script>
