<template>
	<section aria-labelledby="writing-title">
		<div class="container">
			<p class="section-label">{{ copy.label }}</p>
			<h2 class="section-title" id="writing-title">{{ copy.title }}</h2>
			<ul :class="styles['writing-grid']">
				<li v-for="post in writing" :key="post.title">
					<RouterLink :to="post.href" :class="styles['writing-card']" data-reveal>
						<span :class="styles['writing-tag']">{{ post.tag }}</span>
						<h3 :class="styles['writing-title']">{{ post.title }}</h3>
						<p :class="styles['writing-blurb']">{{ post.blurb }}</p>
						<span :class="styles['writing-more']">{{ copy.readMore }}</span>
					</RouterLink>
				</li>
			</ul>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { HomeContent, WritingTeaserItem } from '@fg/shared';
import styles from '@styles/components/writing.module.css';
import { RouterLink } from 'vue-router';

defineProps<{ writing: WritingTeaserItem[]; copy: HomeContent['sections']['writing'] }>();
</script>
