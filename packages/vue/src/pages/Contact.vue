<template>
	<section>
		<div class="container">
			<span class="section-label">Available Now</span>
			<h2 class="section-title">{{ content?.title ?? "Let's work together." }}</h2>
			<p style="color: var(--jb-text-secondary)">{{ content?.body ?? 'Get in touch for consulting, freelance projects, or collaboration.' }}</p>

			<output v-if="sent" class="contact-success">Thanks — I'll be in touch shortly.</output>
			<form v-else novalidate class="contact-form" @submit.prevent="onSubmit">
				<jb-input name="name" label="Name" :value="name" @input="name = ($event.target as HTMLInputElement).value" required />
				<jb-input name="email" type="email" label="Email" autocomplete="email" :value="email" @input="email = ($event.target as HTMLInputElement).value" required />
				<jb-textarea name="message" label="Message" :value="message" @input="message = ($event.target as HTMLTextAreaElement).value" required />
				<button type="submit" class="btn">Send</button>
			</form>

			<p class="contact-meta">
				<jb-tech-tag>Vue</jb-tech-tag>
				<jb-tech-tag>TypeScript</jb-tech-tag>
				<jb-tech-tag>Vite</jb-tech-tag>
			</p>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useContent } from '../composables/useContent';

const { content } = useContent('contact');

// Two-way binding via :value + @input rather than v-model: Vue's SSR compiler only
// allows v-model on <input>/<textarea>/<select>, not custom elements, so v-model here
// would crash the static build. This is the equivalent native-element binding.
const name = ref('');
const email = ref('');
const message = ref('');
const sent = ref(false);

function onSubmit(e: Event) {
	const form = e.target as HTMLFormElement;
	// Native constraint validation flows through the form-associated elements.
	if (!form.checkValidity()) {
		form.reportValidity();
		return;
	}
	// Client-only for this slice — backend submission is a later step.
	sent.value = true;
}
</script>
