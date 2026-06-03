<template>
	<output v-if="sent" class="contact-success">Thanks — I'll be in touch shortly.</output>
	<form v-else novalidate class="contact-form" @submit.prevent="onSubmit">
		<jb-input
			name="name"
			label="Name"
			:value="name"
			@input="name = ($event.target as HTMLInputElement).value"
			required
		/>
		<jb-input
			name="email"
			type="email"
			label="Email"
			autocomplete="email"
			:value="email"
			@input="email = ($event.target as HTMLInputElement).value"
			required
		/>
		<jb-textarea
			name="message"
			label="Message"
			:value="message"
			@input="message = ($event.target as HTMLTextAreaElement).value"
			required
		/>
		<button type="submit" class="btn">Send</button>
	</form>
</template>

<script setup lang="ts">
// Self-contained contact form composite — the same form the Contact page uses, built as a
// Vue SFC. Two-way binding via :value + @input (Vue's compiler disallows v-model on custom
// elements), the equivalent native-element binding. Cross-framework visual-parity subject.
import { ref } from 'vue';

const name = ref('');
const email = ref('');
const message = ref('');
const sent = ref(false);

function onSubmit(e: Event) {
	const form = e.target as HTMLFormElement;
	if (!form.checkValidity()) {
		form.reportValidity();
		return;
	}
	sent.value = true;
}
</script>
