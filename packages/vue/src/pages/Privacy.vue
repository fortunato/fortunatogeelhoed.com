<template>
	<ContentPage label="Privacy" :content="content" />
</template>

<script setup lang="ts">
import ContentPage from '../components/ContentPage.vue';
import { useContent } from '../composables/useContent';

const { content } = useContent('privacy');
</script>
