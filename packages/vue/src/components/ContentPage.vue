<template>
	<section>
		<div class="container">
			<span class="section-label">{{ label }}</span>
			<h1 class="section-title">{{ content?.title ?? '' }}</h1>
			<!-- Trusted, build-rendered page HTML. -->
			<div :class="styles.prose" v-html="content?.html ?? ''" />
		</div>
	</section>
</template>

<script setup lang="ts">
import type { ContentItem } from '@fg/shared';
import styles from '@styles/components/prose.module.css';

// A long-form content page (Services, Privacy): a section label and title, then the page's
// build-rendered markdown HTML under the shared prose styles. The same component backs every
// such page so headings, lists, and in-content links render identically across the frameworks.
defineProps<{ label: string; content: ContentItem | null }>();
</script>
