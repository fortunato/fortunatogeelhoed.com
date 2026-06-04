<template>
	<footer :class="styles.footer">
		<div :class="[styles['footer-inner'], 'container']">
			<span :class="styles['footer-brand']">
				FORTUNATO<span :class="styles['footer-dot']">.</span>GEELHOED
			</span>
			<nav :class="styles['footer-links']" aria-label="Social and external links">
				<a href="https://www.linkedin.com/in/fortunatogeelhoed/">
					<jb-icon name="linkedin" />
					LinkedIn
				</a>
				<a href="https://github.com/fortunato">
					<jb-icon name="github" />
					GitHub
				</a>
			</nav>
			<p :class="styles['footer-legal']">
				© {{ year }} JiggyBit S.L. — built in React, Vue and Angular on one backend.
			</p>
		</div>
	</footer>
</template>

<script setup lang="ts">
import styles from '@styles/components/footer.module.css';

const year = new Date().getFullYear();
</script>
