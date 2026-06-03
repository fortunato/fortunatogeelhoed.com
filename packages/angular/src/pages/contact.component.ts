import { CUSTOM_ELEMENTS_SCHEMA, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContentService } from '../content.service';
import { JbControlValueAccessor } from '../directives/jb-input.value-accessor';

@Component({
	selector: 'app-contact',
	standalone: true,
	// ReactiveFormsModule + the CVA directive bind the form to the <jb-*> controls;
	// CUSTOM_ELEMENTS_SCHEMA allows the custom-element tags in the template.
	imports: [ReactiveFormsModule, JbControlValueAccessor],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	template: `
		<section>
			<div class="container">
				<span class="section-label">Available Now</span>
				<h2 class="section-title">{{ content?.title ?? "Let's work together." }}</h2>
				<p style="color: var(--jb-text-secondary)">{{ content?.body ?? 'Get in touch for consulting, freelance projects, or collaboration.' }}</p>

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

				<p class="contact-meta">
					<jb-tech-tag>Angular</jb-tech-tag>
					<jb-tech-tag>TypeScript</jb-tech-tag>
					<jb-tech-tag>Vite</jb-tech-tag>
				</p>
			</div>
		</section>
	`,
})
export class ContactComponent {
	private contentService = inject(ContentService);
	private fb = inject(FormBuilder);

	content = this.contentService.getContent('contact');
	sent = false;

	// Reactive Forms drive validation; the CVA keeps each control synced to its <jb-*> element.
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
		// Client-only for this slice — backend submission is a later step.
		this.sent = true;
	}
}
