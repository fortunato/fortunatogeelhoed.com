<template>
	<section>
		<div class="container">
			<p class="section-label">Latest writing</p>
			<h2 class="section-title">From the blog</h2>
			<div :class="styles['writing-grid']">
				<RouterLink
					v-for="post in writing"
					:key="post.title"
					:to="post.href"
					:class="['card', styles['writing-card']]"
					data-reveal
				>
					<h3 :class="styles['writing-title']">{{ post.title }}</h3>
					<p :class="styles['writing-blurb']">{{ post.blurb }}</p>
					<span :class="styles['writing-more']">Read more →</span>
				</RouterLink>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { WritingTeaserItem } from '@fg/shared';
import styles from '@styles/components/home.module.css';
import { RouterLink } from 'vue-router';

defineProps<{ writing: WritingTeaserItem[] }>();
</script>
