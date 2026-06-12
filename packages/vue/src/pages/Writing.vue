<template>
	<section>
		<div class="container">
			<span class="section-label">Writing</span>
			<h1 class="section-title">{{ content?.title ?? 'Writing' }}</h1>
			<p
				v-if="content?.description"
				style="color: var(--jb-text-secondary); max-width: 62ch"
			>
				{{ content.description }}
			</p>
			<ul :class="styles['writing-grid']">
				<li v-for="post in published" :key="post.slug">
					<RouterLink :to="articlePath(post.slug)" :class="styles['writing-card']" data-reveal>
						<span :class="styles['writing-tag']">{{ post.tag }}</span>
						<h2 :class="styles['writing-title']">{{ post.title }}</h2>
						<p :class="styles['writing-blurb']">{{ post.description }}</p>
						<span :class="styles['writing-meta']">
							{{ formatDate(post.date) }} · {{ post.readingMinutes }} min read
						</span>
						<span :class="styles['writing-more']">Read more</span>
					</RouterLink>
				</li>
			</ul>
		</div>
	</section>
</template>

<script setup lang="ts">
import postsData from '@fg/content-data/posts.json';
import { type Article, articlePath } from '@fg/shared';
import styles from '@styles/components/writing.module.css';
import { RouterLink } from 'vue-router';
import { useContent } from '../composables/useContent';

const published = (postsData as { published: Article[] }).published;
const { content } = useContent('writing');

// Render an ISO date (YYYY-MM-DD) as a long, readable form. Fixed locale and UTC so the
// prerendered output is deterministic and identical across the three framework builds.
function formatDate(iso: string | undefined): string {
	if (!iso) return '';
	const date = new Date(`${iso}T00:00:00Z`);
	return new Intl.DateTimeFormat('en-GB', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	}).format(date);
}
</script>
