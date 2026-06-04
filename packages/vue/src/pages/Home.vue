<template>
	<section :class="styles.hero">
		<div class="container">
			<p class="section-label">{{ home.hero.tagline }}</p>
			<h1 :class="styles['hero-name']" data-reveal>{{ home.hero.name }}</h1>
			<p :class="styles['hero-statement']" data-reveal>{{ home.hero.statement }}</p>
		</div>
	</section>

	<section>
		<div class="container">
			<p class="section-label">What I do</p>
			<h2 class="section-title">Services</h2>
			<div :class="styles['services-grid']">
				<article v-for="service in home.services" :key="service.title" class="card" data-reveal>
					<h3 :class="styles['service-title']">{{ service.title }}</h3>
					<p :class="styles['service-desc']">{{ service.description }}</p>
				</article>
			</div>
		</div>
	</section>

	<section :class="styles.proof">
		<div class="container">
			<p class="section-label">Proof</p>
			<div :class="styles['proof-grid']">
				<div v-for="point in home.proof" :key="point.label" data-reveal>
					<p :class="styles['proof-metric']">{{ point.metric }}</p>
					<p :class="styles['proof-label']">{{ point.label }}</p>
				</div>
			</div>
		</div>
	</section>

	<section>
		<div class="container">
			<p class="section-label">Latest writing</p>
			<h2 class="section-title">From the blog</h2>
			<div :class="styles['writing-grid']">
				<RouterLink
					v-for="post in home.writing"
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

	<section :class="styles.cta">
		<div class="container">
			<h2 :class="styles['cta-heading']" data-reveal>{{ home.cta.heading }}</h2>
			<RouterLink :to="home.cta.href" class="btn">Get in touch</RouterLink>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { HomeContent } from '@fg/shared';
import styles from '@styles/components/home.module.css';
import { RouterLink } from 'vue-router';
import homeData from '../../../content/home.json';

const home = homeData as HomeContent;
</script>
