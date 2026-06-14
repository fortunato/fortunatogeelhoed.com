<template>
	<footer :class="styles.footer">
		<div :class="[styles['footer-inner'], 'container']">
			<span :class="styles['footer-brand']">
				FORTUNATO<span :class="styles['footer-dot']">.</span>GEELHOED
			</span>
			<nav :class="styles['footer-links']" aria-label="Social and external links">
				<a
					href="https://www.linkedin.com/in/fortunatogeelhoed/"
					target="_blank"
					rel="noopener noreferrer"
				>
					<jb-icon name="linkedin" />
					LinkedIn
				</a>
				<a href="https://github.com/fortunato" target="_blank" rel="noopener noreferrer">
					<jb-icon name="github" />
					GitHub
				</a>
			</nav>
			<div :class="styles['footer-legal']">
				<span>© {{ year }} JiggyBit S.L., built in React, Vue and Angular on one backend.</span>
				<nav :class="styles['footer-meta']" aria-label="Legal">
					<RouterLink to="/privacy">Privacy</RouterLink>
				</nav>
			</div>
		</div>
	</footer>
</template>

<script setup lang="ts">
import styles from '@styles/components/footer.module.css';
import { RouterLink } from 'vue-router';

const year = new Date().getFullYear();
</script>
