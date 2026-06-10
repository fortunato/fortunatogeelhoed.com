<template>
	<output v-if="sent" class="contact-success">Thanks, I'll be in touch shortly.</output>
	<form v-else novalidate class="contact-form" @submit.prevent="form.handleSubmit()">
		<form.Field
			name="name"
			:listeners="{ onChange: ({ fieldApi }) => fieldApi.setErrorMap({ onSubmit: undefined }) }"
		>
			<template #default="{ field }">
				<div class="contact-field">
					<jb-input
						name="name"
						label="Name"
						:value="field.state.value"
						:disabled="disabled"
						:error-id="field.state.meta.isTouched && field.state.meta.errors.length ? 'error-name' : undefined"
						@input="field.handleChange(($event.target as HTMLInputElement).value)"
						@blur="field.handleBlur"
					/>
					<p v-if="field.state.meta.isTouched && field.state.meta.errors.length" id="error-name" class="field-error">
						{{ field.state.meta.errors[0]?.message }}
					</p>
				</div>
			</template>
		</form.Field>
		<form.Field
			name="email"
			:listeners="{ onChange: ({ fieldApi }) => fieldApi.setErrorMap({ onSubmit: undefined }) }"
		>
			<template #default="{ field }">
				<div class="contact-field">
					<jb-input
						name="email"
						type="email"
						label="Email"
						autocomplete="email"
						:value="field.state.value"
						:disabled="disabled"
						:error-id="field.state.meta.isTouched && field.state.meta.errors.length ? 'error-email' : undefined"
						@input="field.handleChange(($event.target as HTMLInputElement).value)"
						@blur="field.handleBlur"
					/>
					<p v-if="field.state.meta.isTouched && field.state.meta.errors.length" id="error-email" class="field-error">
						{{ field.state.meta.errors[0]?.message }}
					</p>
				</div>
			</template>
		</form.Field>
		<form.Field
			name="message"
			:listeners="{ onChange: ({ fieldApi }) => fieldApi.setErrorMap({ onSubmit: undefined }) }"
		>
			<template #default="{ field }">
				<div class="contact-field">
					<jb-textarea
						name="message"
						label="Message"
						:value="field.state.value"
						:disabled="disabled"
						:error-id="field.state.meta.isTouched && field.state.meta.errors.length ? 'error-message' : undefined"
						@input="field.handleChange(($event.target as HTMLTextAreaElement).value)"
						@blur="field.handleBlur"
					/>
					<p v-if="field.state.meta.isTouched && field.state.meta.errors.length" id="error-message" class="field-error">
						{{ field.state.meta.errors[0]?.message }}
					</p>
				</div>
			</template>
		</form.Field>
		<div class="contact-hp" aria-hidden="true">
			<input
				type="text"
				name="company"
				tabindex="-1"
				autocomplete="off"
				:value="company"
				@input="company = ($event.target as HTMLInputElement).value"
			/>
		</div>
		<p v-if="failed" class="contact-error" role="alert">
			Something went wrong sending your message. Please try again.
		</p>
		<p class="contact-privacy">
			Your name, email, and message are emailed to me so I can reply. They are not stored on
			this site.
		</p>
		<button type="submit" class="btn btn--marketing" :disabled="disabled">Send</button>
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
// True when a valid submission could not be delivered (a 502, or the request never reached the
// server). Surfaces a general "try again" message rather than a false success.
const failed = ref(false);
// Honeypot: a hidden field no human fills. Sent with the payload; the server silently drops any
// submission that arrives with it set. Kept out of the shared schema so it stays a private trap.
const company = ref('');

const form = useForm({
	defaultValues: { name: '', email: '', message: '' } as ContactFormData,
	validators: {
		onChange: contactSchema,
		// The submission itself. The server re-validates with the same schema (authoritative);
		// returning field errors here surfaces them on the matching fields through TanStack's own
		// error state. Each field's listener clears its own server error on edit (matching React and
		// Angular), so there is no parallel server-error store.
		onSubmitAsync: async ({ value }) => {
			failed.value = false;
			let res: Response;
			try {
				res = await fetch('/api/contact', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ ...value, company: company.value }),
				});
			} catch {
				// Never reached the server — fail the submit so the success view does not show.
				failed.value = true;
				return 'send-failed';
			}
			if (res.ok) return undefined;
			const body = (await res.json().catch(() => null)) as {
				errors?: Partial<Record<keyof ContactFormData, string[]>>;
			} | null;
			const fields: Partial<Record<keyof ContactFormData, { message: string }>> = {};
			for (const field of ['name', 'email', 'message'] as const) {
				const message = body?.errors?.[field]?.[0];
				if (message) fields[field] = { message };
			}
			// A 502 (valid but undelivered) carries no field errors — surface the general message
			// and keep the submit failed so onSubmit (success) never runs.
			if (Object.keys(fields).length === 0) {
				failed.value = true;
				return 'send-failed';
			}
			return { fields };
		},
	},
	onSubmit: () => {
		sent.value = true;
	},
});
</script>

