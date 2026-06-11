<template>
	<section>
		<div class="container">
			<span class="section-label" data-availability-badge :data-state="availability.available ? 'available' : 'booked'">{{ availabilityBadge(availability) }}</span>
			<h1 class="section-title">{{ content?.title ?? "Let's work together." }}</h1>
			<p data-availability-line style="color: var(--jb-text-secondary)">{{ body }}</p>

			<ContactForm />
		</div>
	</section>
</template>

<script setup lang="ts">
import { availabilityBadge, availabilityBookedLine } from '@fg/shared';
import { computed } from 'vue';
import ContactForm from '../components/ContactForm.vue';
import { useAvailability } from '../composables/useAvailability';
import { useContent } from '../composables/useContent';

const { content } = useContent('contact');
const { availability } = useAvailability();

// Regular copy when available; the adapted sub-line when booked.
const body = computed(() =>
	availability.value.available
		? (content?.body ?? 'Get in touch for consulting, freelance projects, or collaboration.')
		: availabilityBookedLine(availability.value),
);
</script>
