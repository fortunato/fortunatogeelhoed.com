import { CUSTOM_ELEMENTS_SCHEMA, Component, effect, input, signal } from '@angular/core';
import {
	type FieldState,
	FormField,
	disabled,
	form,
	submit,
	validateStandardSchema,
} from '@angular/forms/signals';
import { type ContactFormData, contactSchema } from '@fg/shared/validation/contact';
import { JbControlValueAccessor } from '../directives/jb-input.value-accessor';

// Contact form composite built with Angular's signal-based forms (@angular/forms/signals).
// A single Zod schema — shared with the React and Vue forms and with the server that receives
// the submission — drives validation through validateStandardSchema, so the rules live in one
// place. The [formField] directive binds each field to its <jb-*> web component through the
// shared JbControlValueAccessor; CUSTOM_ELEMENTS_SCHEMA permits the custom-element tags.
// Cross-framework parity subject.
@Component({
	selector: 'app-contact-form',
	standalone: true,
	imports: [FormField, JbControlValueAccessor],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	template: `
		@if (sent()) {
			<output class="contact-success">Thanks — I'll be in touch shortly.</output>
		} @else {
			<form class="contact-form" novalidate (submit)="onSubmit($event)">
				<div class="contact-field">
					<jb-input name="name" label="Name" [formField]="form.name"></jb-input>
					@if (fieldError(form.name(), serverErrors().name); as msg) {
						<p class="field-error">{{ msg }}</p>
					}
				</div>
				<div class="contact-field">
					<jb-input
						name="email"
						type="email"
						label="Email"
						autocomplete="email"
						[formField]="form.email"
					></jb-input>
					@if (fieldError(form.email(), serverErrors().email); as msg) {
						<p class="field-error">{{ msg }}</p>
					}
				</div>
				<div class="contact-field">
					<jb-textarea name="message" label="Message" [formField]="form.message"></jb-textarea>
					@if (fieldError(form.message(), serverErrors().message); as msg) {
						<p class="field-error">{{ msg }}</p>
					}
				</div>
				<button type="submit" class="btn" [disabled]="disabled()">Send</button>
			</form>
		}
	`,
})
export class ContactFormComponent {
	// Disables every control — used while a submission is in flight and by the showcase.
	readonly disabled = input(false);

	protected readonly sent = signal(false);
	protected readonly serverErrors = signal<Partial<Record<keyof ContactFormData, string>>>({});

	protected readonly model = signal<ContactFormData>({ name: '', email: '', message: '' });
	protected readonly form = form(this.model, (path) => {
		validateStandardSchema(path, contactSchema);
		disabled(path, () => this.disabled());
	});

	constructor() {
		// A server error is only meaningful until the visitor edits the form again.
		effect(() => {
			this.model();
			this.serverErrors.set({});
		});
	}

	// Show the client (Zod) message once a field is touched; otherwise surface a server message.
	protected fieldError(state: FieldState<string>, serverMessage?: string): string | undefined {
		if (state.touched() && state.errors().length > 0) return state.errors()[0].message;
		return serverMessage;
	}

	protected async onSubmit(event: Event): Promise<void> {
		event.preventDefault();
		// Reveal any outstanding client errors even if the user never blurred a field.
		this.form.name().markAsTouched();
		this.form.email().markAsTouched();
		this.form.message().markAsTouched();

		// submit() runs the action only when the schema passes; the server re-validates with the
		// same schema (authoritative) so we map any 4xx field errors back onto the form.
		await submit(this.form, {
			action: async () => {
				const res = await fetch('/api/contact', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(this.model()),
				});
				if (res.ok) {
					this.sent.set(true);
					return undefined;
				}
				const body = (await res.json().catch(() => null)) as {
					errors?: Partial<Record<keyof ContactFormData, string[]>>;
				} | null;
				this.serverErrors.set({
					name: body?.errors?.name?.[0],
					email: body?.errors?.email?.[0],
					message: body?.errors?.message?.[0],
				});
				return undefined;
			},
		});
	}
}
