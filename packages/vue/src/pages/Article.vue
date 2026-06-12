<template>
	<section>
		<div class="container">
			<template v-if="article">
				<p class="section-label">{{ article.tag }}</p>
				<h1 class="section-title">{{ article.title }}</h1>
				<p class="writing-tag" style="display: block; margin-bottom: var(--jb-space-lg)">
					{{ formatDate(article.date) }} · {{ article.tag }} · {{ article.readingMinutes }} min
					read
				</p>

				<!-- Trusted, build-rendered article HTML. -->
				<div :class="styles.prose" v-html="article.html" />

				<p style="margin-top: var(--jb-space-xl)">
					<RouterLink :to="WRITING_BASE" class="link link--arrow">Back to writing</RouterLink>
				</p>
			</template>

			<template v-else>
				<h1 class="section-title">Not found</h1>
				<p style="color: var(--jb-text-secondary)">That article does not exist.</p>
				<RouterLink :to="WRITING_BASE" class="link link--arrow">Back to writing</RouterLink>
			</template>
		</div>
	</section>
</template>

<script setup lang="ts">
import postsData from '@fg/content-data/posts.json';
import { type Article, SITE_NAME, SITE_URL, WRITING_BASE, articlePath } from '@fg/shared';
import styles from '@styles/components/prose.module.css';
import { useHead } from '@unhead/vue';
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const published = (postsData as { published: Article[] }).published;
const route = useRoute();
const article = computed(() => published.find((post) => post.slug === route.params.slug));

// Per-article head for the Vue render: title, meta description, and canonical at minimum, plus the
// Open Graph article tags so a shared link unfurls correctly. The canonical points at the single
// indexed URL regardless of which framework rendered the page. Reactive so client-side navigation
// between articles updates the head too.
useHead(
	computed(() => {
		const a = article.value;
		if (!a) return { title: `Not found | ${SITE_NAME}` };
		const canonical = `${SITE_URL}${articlePath(a.slug)}`;
		const image = `${SITE_URL}${a.ogImage}`;
		const description = a.description ?? '';
		return {
			title: a.title,
			link: [{ rel: 'canonical', href: canonical }],
			meta: [
				{ name: 'description', content: description },
				{ property: 'og:type', content: 'article' },
				{ property: 'og:site_name', content: SITE_NAME },
				{ property: 'og:title', content: a.title },
				{ property: 'og:description', content: description },
				{ property: 'og:url', content: canonical },
				{ property: 'og:image', content: image },
				{ name: 'twitter:card', content: 'summary_large_image' },
				{ name: 'twitter:title', content: a.title },
				{ name: 'twitter:description', content: description },
				{ name: 'twitter:image', content: image },
			],
		};
	}),
);

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
