<template>
	<section>
		<div class="container">
			<span class="section-label">Available Now</span>
			<h2 class="section-title">{{ content?.title ?? "Let's work together." }}</h2>
			<p style="color: var(--jb-text-secondary)">{{ content?.body ?? 'Get in touch for consulting, freelance projects, or collaboration.' }}</p>

			<ContactForm />

			<p class="contact-meta">
				<jb-tech-tag>Vue</jb-tech-tag>
				<jb-tech-tag>TypeScript</jb-tech-tag>
				<jb-tech-tag>Vite</jb-tech-tag>
			</p>
		</div>
	</section>
</template>

<script setup lang="ts">
import ContactForm from '../components/ContactForm.vue';
import { useContent } from '../composables/useContent';

const { content } = useContent('contact');
</script>
