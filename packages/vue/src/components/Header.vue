<template>
	<header :class="styles.header">
		<RouterLink to="/" :class="styles.logo">
			FORTUNATO<span :class="styles.dot">.</span>GEELHOED
		</RouterLink>
		<div :class="styles['header-right']">
			<nav :class="styles.nav">
				<RouterLink v-for="item in navItems" :key="item.path" :to="item.path">
					{{ item.label }}
				</RouterLink>
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
			<jb-theme-toggle />
		</div>
	</header>
</template>

<script setup lang="ts">
import { NAV_ITEMS } from '@fg/shared';
import styles from '@styles/components/header.module.css';
import { RouterLink } from 'vue-router';

const navItems = NAV_ITEMS;
</script>
