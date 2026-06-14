<template>
	<a class="skip-link" href="#main">Skip to content</a>
	<Header />
	<!-- data-nav-enter is baked into the prerendered markup so the landing entrance plays from first
	     paint with no flash; the shared interceptor re-toggles it on each in-app navigation. -->
	<main id="main" tabindex="-1" data-nav-enter="">
		<RouterView />
	</main>
	<Footer />
	<BottomNav />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import BottomNav from './components/BottomNav.vue';
import Footer from './components/Footer.vue';
import Header from './components/Header.vue';
</script>
