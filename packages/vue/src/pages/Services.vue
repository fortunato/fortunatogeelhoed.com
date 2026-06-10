<template>
	<section>
		<div class="container">
			<span class="section-label">What I Do</span>
			<h1 class="section-title">{{ content?.title ?? 'Services' }}</h1>
			<div
				style="
					max-width: 62ch;
					display: flex;
					flex-direction: column;
					gap: var(--jb-space-md);
					color: var(--jb-text-secondary);
					line-height: 1.7;
				"
			>
				<p v-for="paragraph in paragraphs" :key="paragraph.slice(0, 32)">{{ paragraph }}</p>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { toParagraphs } from '@fg/shared';
import { useContent } from '../composables/useContent';

const { content } = useContent('services');
const paragraphs = toParagraphs(content?.body ?? '');
</script>
