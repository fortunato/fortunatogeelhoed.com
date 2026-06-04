<template>
	<Header />
	<main>
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
