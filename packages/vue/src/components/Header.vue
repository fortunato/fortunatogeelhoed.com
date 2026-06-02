<template>
	<header :class="styles.header">
		<RouterLink to="/" :class="styles.logo">
			FORTUNATO<span :class="styles.dot">.</span>GEELHOED
		</RouterLink>
		<div :class="styles['header-right']">
			<nav :class="styles.nav">
				<RouterLink to="/services">Services</RouterLink>
				<RouterLink to="/work">Work</RouterLink>
				<RouterLink to="/blog">Blog</RouterLink>
				<RouterLink to="/contact">Contact</RouterLink>
			</nav>
			<div :class="styles.sep" />
			<div :class="styles.switcher">
				<span :class="styles['switcher-label']">Built with</span>
				<div :class="styles['switcher-buttons']">
					<a :class="styles['switcher-btn']" href="/__switch?to=react">react</a>
					<a :class="[styles['switcher-btn'], styles.active]" href="/__switch?to=vue">vue</a>
					<a :class="styles['switcher-btn']" href="/__switch?to=angular">angular</a>
				</div>
			</div>
			<button
				type="button"
				:class="styles['theme-toggle']"
				@click="toggleTheme()"
				aria-label="Toggle color theme"
			>
				<svg
					:class="styles.moon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
				</svg>
				<svg
					:class="styles.sun"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="4" />
					<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
				</svg>
			</button>
		</div>
	</header>
</template>

<script setup lang="ts">
import { toggleTheme } from '@fg/shared';
import styles from '@styles/components/header.module.css';
import { RouterLink } from 'vue-router';
</script>
