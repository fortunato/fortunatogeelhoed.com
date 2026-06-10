<template>
	<section :class="styles.about">
		<article :class="[styles['about-inner'], 'container']">
			<figure :class="styles['about-photo']">
				<!-- Bound src (not a static attribute) so Vue's SFC compiler treats it as a runtime
				     URL served by the API, not a build-time module import to resolve. -->
				<img :src="photoSrc" :alt="photoAlt" width="480" height="600" decoding="async" />
			</figure>
			<div :class="styles['about-prose']">
				<span class="section-label">About</span>
				<h1 class="section-title">Fortunato Geelhoed</h1>
				<p
					v-for="(paragraph, index) in paragraphs"
					:key="paragraph.slice(0, 32)"
					:class="index === 0 ? styles['about-lead'] : undefined"
				>
					{{ paragraph }}
				</p>
				<div :class="styles['about-cta']">
					<RouterLink to="/career" :class="styles['about-cta-primary']">
						View the career timeline
					</RouterLink>
					<a :href="githubRepoUrl" target="_blank" rel="noopener noreferrer">
						<jb-icon name="github" />
						View the source
					</a>
					<a :href="linkedinUrl" target="_blank" rel="noopener noreferrer">
						<jb-icon name="linkedin" />
						LinkedIn
					</a>
				</div>
			</div>
		</article>
	</section>
</template>

<script setup lang="ts">
import { GITHUB_REPO_URL, LINKEDIN_URL, toParagraphs } from '@fg/shared';
import styles from '@styles/components/about.module.css';
import { RouterLink } from 'vue-router';
import { useContent } from '../composables/useContent';

const { content } = useContent('about');
const paragraphs = toParagraphs(content?.body ?? '');
const photoSrc = '/assets/images/fortunato.webp';
const photoAlt =
	'Fortunato Geelhoed, freelance full-stack TypeScript engineer based on the Costa Blanca, Spain';
const githubRepoUrl = GITHUB_REPO_URL;
const linkedinUrl = LINKEDIN_URL;
</script>
