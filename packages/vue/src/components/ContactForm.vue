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
						@input="field.handleChange(($event.target as HTMLInputElement).value)"
						@blur="field.handleBlur"
					/>
					<p v-if="field.state.meta.isTouched && field.state.meta.errors.length" class="field-error">
						{{ field.state.meta.errors[0]?.message }}
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
						@input="field.handleChange(($event.target as HTMLInputElement).value)"
						@blur="field.handleBlur"
					/>
					<p v-if="field.state.meta.isTouched && field.state.meta.errors.length" class="field-error">
						{{ field.state.meta.errors[0]?.message }}
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
						@input="field.handleChange(($event.target as HTMLTextAreaElement).value)"
						@blur="field.handleBlur"
					/>
					<p v-if="field.state.meta.isTouched && field.state.meta.errors.length" class="field-error">
						{{ field.state.meta.errors[0]?.message }}
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

const form = useForm({
	defaultValues: { name: '', email: '', message: '' } as ContactFormData,
	validators: {
		onChange: contactSchema,
		// The submission itself. The server re-validates with the same schema (authoritative);
		// returning field errors here surfaces them on the matching fields through TanStack's own
		// error state, so there is no parallel server-error store. They refresh on the next submit.
		onSubmitAsync: async ({ value }) => {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(value),
			});
			if (res.ok) return undefined;
			const body = (await res.json().catch(() => null)) as {
				errors?: Partial<Record<keyof ContactFormData, string[]>>;
			} | null;
			const fields: Partial<Record<keyof ContactFormData, { message: string }>> = {};
			for (const field of ['name', 'email', 'message'] as const) {
				const message = body?.errors?.[field]?.[0];
				if (message) fields[field] = { message };
			}
			return { fields };
		},
	},
	onSubmit: () => {
		sent.value = true;
	},
});
</script>
