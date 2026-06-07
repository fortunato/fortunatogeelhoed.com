import { CUSTOM_ELEMENTS_SCHEMA, Component, input, signal } from '@angular/core';
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
			<output class="contact-success">Thanks, I'll be in touch shortly.</output>
		} @else {
			<form class="contact-form" novalidate (submit)="onSubmit($event)">
				<div class="contact-field">
					<jb-input name="name" label="Name" [formField]="form.name"></jb-input>
					@if (fieldError(form.name()); as msg) {
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
					@if (fieldError(form.email()); as msg) {
						<p class="field-error">{{ msg }}</p>
					}
				</div>
				<div class="contact-field">
					<jb-textarea name="message" label="Message" [formField]="form.message"></jb-textarea>
					@if (fieldError(form.message()); as msg) {
						<p class="field-error">{{ msg }}</p>
					}
				</div>
				<div class="contact-hp" aria-hidden="true">
						<input
							type="text"
							name="company"
							tabindex="-1"
							autocomplete="off"
							[value]="company()"
							(input)="company.set($any($event.target).value)"
						/>
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

	// Honeypot: a hidden field no human fills. Sent with the payload; the server silently drops any
	// submission that arrives with it set. Kept out of the shared schema so it stays a private trap.
	protected readonly company = signal('');

	protected readonly model = signal<ContactFormData>({ name: '', email: '', message: '' });
	protected readonly form = form(this.model, (path) => {
		validateStandardSchema(path, contactSchema);
		disabled(path, () => this.disabled());
	});

	// Errors read straight off the field: client (Zod) errors once it is touched, plus any server
	// errors that submit() applied. Signal Forms re-validates on edit, so a server error clears as
	// soon as its field changes — no parallel server-error store to keep in sync.
	protected fieldError(state: FieldState<string>): string | undefined {
		if (state.touched() && state.errors().length > 0) return state.errors()[0].message;
		return undefined;
	}

	protected async onSubmit(event: Event): Promise<void> {
		event.preventDefault();
		// Reveal any outstanding client errors even if the user never blurred a field.
		this.form.name().markAsTouched();
		this.form.email().markAsTouched();
		this.form.message().markAsTouched();

		// submit() runs the action only when the schema passes; the server re-validates with the
		// same schema (authoritative). Field-bound errors returned from the action are applied to
		// the matching fields as native ValidationErrors.
		await submit(this.form, {
			action: async () => {
				const res = await fetch('/api/contact', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ ...this.model(), company: this.company() }),
				});
				if (res.ok) {
					this.sent.set(true);
					return undefined;
				}
				const body = (await res.json().catch(() => null)) as {
					errors?: Partial<Record<keyof ContactFormData, string[]>>;
				} | null;
				const fields = {
					name: this.form.name,
					email: this.form.email,
					message: this.form.message,
				};
				return (Object.keys(fields) as (keyof ContactFormData)[])
					.map((field) => ({ field, message: body?.errors?.[field]?.[0] }))
					.filter(
						(e): e is { field: keyof ContactFormData; message: string } => !!e.message,
					)
					.map((e) => ({
						fieldTree: fields[e.field],
						kind: 'server',
						message: e.message,
					}));
			},
		});
	}
}
