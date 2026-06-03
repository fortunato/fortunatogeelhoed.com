import { CUSTOM_ELEMENTS_SCHEMA, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { JbControlValueAccessor } from '../directives/jb-input.value-accessor';

// Self-contained contact form composite — the same form the Contact page uses, built with
// Angular Reactive Forms. The CVA directive bridges each <jb-*> element to a form control;
// CUSTOM_ELEMENTS_SCHEMA permits the custom-element tags. Cross-framework parity subject.
@Component({
	selector: 'app-contact-form',
	standalone: true,
	imports: [ReactiveFormsModule, JbControlValueAccessor],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	template: `
		@if (sent) {
			<output class="contact-success">Thanks — I'll be in touch shortly.</output>
		} @else {
			<form class="contact-form" [formGroup]="form" (ngSubmit)="onSubmit()">
				<jb-input name="name" label="Name" formControlName="name"></jb-input>
				<jb-input name="email" type="email" label="Email" autocomplete="email" formControlName="email"></jb-input>
				<jb-textarea name="message" label="Message" formControlName="message"></jb-textarea>
				<button type="submit" class="btn">Send</button>
			</form>
		}
	`,
})
export class ContactFormComponent {
	private fb = inject(FormBuilder);
	sent = false;

	form = this.fb.group({
		name: ['', Validators.required],
		email: ['', [Validators.required, Validators.email]],
		message: ['', Validators.required],
	});

	onSubmit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}
		this.sent = true;
	}
}
