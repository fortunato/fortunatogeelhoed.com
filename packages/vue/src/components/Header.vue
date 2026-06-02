<template>
	<header :class="styles.header">
		<RouterLink to="/" :class="styles.logo">
			FORTUNATO<span :class="styles.dot">.</span>GEELHOED
		</RouterLink>
		<div :class="styles.headerRight">
			<nav :class="styles.nav">
				<RouterLink to="/services">Services</RouterLink>
				<RouterLink to="/work">Work</RouterLink>
				<RouterLink to="/blog">Blog</RouterLink>
				<RouterLink to="/contact">Contact</RouterLink>
			</nav>
			<div :class="styles.sep" />
			<div :class="styles.switcher">
				<span :class="styles.switcherLabel">Built with</span>
				<div :class="styles.switcherButtons">
					<button :class="styles.switcherBtn" @click="switchFramework('react')">react</button>
					<button :class="[styles.switcherBtn, styles.active]" @click="switchFramework('vue')">vue</button>
					<button :class="styles.switcherBtn" @click="switchFramework('angular')">angular</button>
				</div>
			</div>
		</div>
	</header>
</template>

<script setup lang="ts">
import styles from '@styles/components/header.module.css';
import { RouterLink } from 'vue-router';

function switchFramework(fw: string) {
	document.cookie = `framework=${fw};path=/;max-age=31536000`;
	const port = window.location.port;
	if (port === '5173' || port === '5174' || port === '5175') {
		window.location.href = `http://localhost:3000${window.location.pathname}`;
	} else {
		window.location.reload();
	}
}
</script>
