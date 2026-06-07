<template>
	<Hero :hero="home.hero" />
	<Services :services="home.services" :copy="home.sections.services" />
	<FrameworkExposure :copy="home.sections.frameworks" />
	<ProofStrip :proof="home.proof" :copy="home.sections.proof" />
	<LatestWriting :writing="home.writing" :copy="home.sections.writing" />
	<CallToAction :cta="home.cta" />
</template>

<script setup lang="ts">
import homeData from '@fg/content-data/home.json';
import type { HomeContent } from '@fg/shared';
import CallToAction from '../components/home/CallToAction.vue';
import FrameworkExposure from '../components/home/FrameworkExposure.vue';
import Hero from '../components/home/Hero.vue';
import LatestWriting from '../components/home/LatestWriting.vue';
import ProofStrip from '../components/home/ProofStrip.vue';
import Services from '../components/home/Services.vue';

const home = homeData as HomeContent;
</script>
