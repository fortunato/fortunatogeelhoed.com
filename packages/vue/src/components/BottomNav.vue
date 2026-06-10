<template>
	<nav :class="styles['bottom-nav']" aria-label="Mobile">
		<RouterLink
			v-for="item in navItems"
			:key="item.path"
			:to="item.path"
			:class="styles['bottom-nav-item']"
		>
			<jb-icon :name="item.icon" />
			{{ item.label }}
		</RouterLink>
	</nav>
</template>

<script setup lang="ts">
import { NAV_ITEMS } from '@fg/shared';
import styles from '@styles/components/bottom-nav.module.css';
import { RouterLink } from 'vue-router';

const navItems = NAV_ITEMS;
</script>
