<template>
	<Hero :hero="home.hero" />
	<Services :services="home.services" />
	<ProofStrip :proof="home.proof" />
	<LatestWriting :writing="home.writing" />
	<CallToAction :cta="home.cta" />
</template>

<script setup lang="ts">
import type { HomeContent } from '@fg/shared';
import homeData from '../../../content/home.json';
import CallToAction from '../components/home/CallToAction.vue';
import Hero from '../components/home/Hero.vue';
import LatestWriting from '../components/home/LatestWriting.vue';
import ProofStrip from '../components/home/ProofStrip.vue';
import Services from '../components/home/Services.vue';

const home = homeData as HomeContent;
</script>
