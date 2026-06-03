<template>
	<output v-if="sent" class="contact-success">Thanks — I'll be in touch shortly.</output>
	<form v-else novalidate class="contact-form" @submit.prevent="form.handleSubmit()">
		<form.Field name="name">
			<template #default="{ field }">
				<div class="contact-field">
					<jb-input
						name="name"
						label="Name"
						:value="field.state.value"
						:disabled="disabled"
						@input="field.handleChange(($event.target as HTMLInputElement).value); clearServerError('name')"
						@blur="field.handleBlur"
					/>
					<p
						v-if="(field.state.meta.isTouched && field.state.meta.errors.length) || serverErrors.name"
						class="field-error"
					>
						{{ (field.state.meta.isTouched && field.state.meta.errors[0]?.message) || serverErrors.name }}
					</p>
				</div>
			</template>
		</form.Field>
		<form.Field name="email">
			<template #default="{ field }">
				<div class="contact-field">
					<jb-input
						name="email"
						type="email"
						label="Email"
						autocomplete="email"
						:value="field.state.value"
						:disabled="disabled"
						@input="field.handleChange(($event.target as HTMLInputElement).value); clearServerError('email')"
						@blur="field.handleBlur"
					/>
					<p
						v-if="(field.state.meta.isTouched && field.state.meta.errors.length) || serverErrors.email"
						class="field-error"
					>
						{{ (field.state.meta.isTouched && field.state.meta.errors[0]?.message) || serverErrors.email }}
					</p>
				</div>
			</template>
		</form.Field>
		<form.Field name="message">
			<template #default="{ field }">
				<div class="contact-field">
					<jb-textarea
						name="message"
						label="Message"
						:value="field.state.value"
						:disabled="disabled"
						@input="field.handleChange(($event.target as HTMLTextAreaElement).value); clearServerError('message')"
						@blur="field.handleBlur"
					/>
					<p
						v-if="(field.state.meta.isTouched && field.state.meta.errors.length) || serverErrors.message"
						class="field-error"
					>
						{{ (field.state.meta.isTouched && field.state.meta.errors[0]?.message) || serverErrors.message }}
					</p>
				</div>
			</template>
		</form.Field>
		<button type="submit" class="btn" :disabled="disabled">Send</button>
	</form>
</template>

<script setup lang="ts">
// Contact form composite built with TanStack Form. A single Zod schema — shared with the React
// and Angular forms and with the server that receives the submission — drives validation: TanStack
// consumes it directly through the Standard Schema interface, so the rules live in one place.
// Binding stays on :value + @input (Vue's compiler disallows v-model on custom elements).
import { type ContactFormData, contactSchema } from '@fg/shared/validation/contact';
import { useForm } from '@tanstack/vue-form';
import { ref } from 'vue';

// Disables every control — used while a submission is in flight and by the showcase.
withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false });

const sent = ref(false);
const serverErrors = ref<Partial<Record<keyof ContactFormData, string>>>({});

const form = useForm({
	defaultValues: { name: '', email: '', message: '' } as ContactFormData,
	validators: { onChange: contactSchema },
	// The server re-validates with the same schema and is authoritative, so map any 4xx field
	// errors back onto the form.
	onSubmit: async ({ value }) => {
		const res = await fetch('/api/contact', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(value),
		});
		if (res.ok) {
			sent.value = true;
			return;
		}
		const body = (await res.json().catch(() => null)) as {
			errors?: Partial<Record<keyof ContactFormData, string[]>>;
		} | null;
		serverErrors.value = {
			name: body?.errors?.name?.[0],
			email: body?.errors?.email?.[0],
			message: body?.errors?.message?.[0],
		};
	},
});

function clearServerError(field: keyof ContactFormData) {
	if (serverErrors.value[field]) {
		const next = { ...serverErrors.value };
		delete next[field];
		serverErrors.value = next;
	}
}
</script>
