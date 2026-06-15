<template>
	<section :class="styles.about">
		<article :class="[styles['about-inner'], 'container']">
			<div :class="styles['about-prose']">
				<span class="section-label">About</span>
				<h1 class="section-title">Fortunato Geelhoed</h1>
				<div :class="styles['about-photo']">
					<!-- Bound src (not a static attribute) so Vue's SFC compiler treats it as a runtime
					     URL served by the API, not a build-time module import to resolve. -->
					<img :src="photoSrc" :alt="photoAlt" width="872" height="594" decoding="async" />
				</div>
				<!-- Trusted, build-rendered page HTML: the bio prose with its in-content links. -->
				<div :class="styles['about-body']" v-html="bodyHtml" />
				<div :class="styles['about-cta']">
					<Button to="/career">View the career timeline</Button>
					<Button
						variant="secondary"
						:href="githubRepoUrl"
						icon="github"
						target="_blank"
						rel="noopener noreferrer"
					>
						View the source
					</Button>
					<Button
						variant="secondary"
						:href="linkedinUrl"
						icon="linkedin"
						target="_blank"
						rel="noopener noreferrer"
					>
						LinkedIn
					</Button>
				</div>
			</div>
		</article>
	</section>
</template>

<script setup lang="ts">
import { GITHUB_REPO_URL, LINKEDIN_URL } from '@fg/shared';
import styles from '@styles/components/about.module.css';
import Button from '../components/ui/Button.vue';
import { useContent } from '../composables/useContent';

const { content } = useContent('about');
const bodyHtml = content?.html ?? '';
const photoSrc = '/assets/images/fortunato.webp';
const photoAlt =
	'Fortunato Geelhoed, freelance full-stack TypeScript engineer based on the Costa Blanca, Spain';
const githubRepoUrl = GITHUB_REPO_URL;
const linkedinUrl = LINKEDIN_URL;
</script>
