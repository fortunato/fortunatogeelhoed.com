import { type ContactFormData, contactSchema } from '@fg/shared/validation/contact';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface ContactFormProps {
	// Disables every control — used while a submission is in flight and by the showcase.
	disabled?: boolean;
}

// Contact form composite built with react-hook-form. A single Zod schema — shared with the
// Vue and Angular forms and with the server that receives the submission — drives validation
// through zodResolver, so the rules live in one place. <Controller> bridges each <jb-*> web
// component (controlled via its `value` property and bubbling native `input` event) to a field.
export function ContactForm({ disabled = false }: ContactFormProps) {
	const [sent, setSent] = useState(false);
	const [serverErrors, setServerErrors] = useState<
		Partial<Record<keyof ContactFormData, string>>
	>({});

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ContactFormData>({
		resolver: zodResolver(contactSchema),
		defaultValues: { name: '', email: '', message: '' },
		mode: 'onTouched',
	});

	const clearServerError = (field: keyof ContactFormData) =>
		setServerErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

	// The server re-validates with the same schema and is authoritative, so map any 4xx field
	// errors back onto the form.
	const onSubmit = handleSubmit(async (data) => {
		const res = await fetch('/api/contact', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(data),
		});
		if (res.ok) {
			setSent(true);
			return;
		}
		const body = (await res.json().catch(() => null)) as {
			errors?: Partial<Record<keyof ContactFormData, string[]>>;
		} | null;
		setServerErrors({
			name: body?.errors?.name?.[0],
			email: body?.errors?.email?.[0],
			message: body?.errors?.message?.[0],
		});
	});

	if (sent) {
		return <output className="contact-success">Thanks — I'll be in touch shortly.</output>;
	}

	return (
		<form onSubmit={onSubmit} noValidate className="contact-form">
			<Controller
				control={control}
				name="name"
				render={({ field }) => (
					<div className="contact-field">
						<jb-input
							name="name"
							label="Name"
							value={field.value}
							disabled={disabled}
							onInput={(e) => {
								field.onChange((e.target as HTMLInputElement).value);
								clearServerError('name');
							}}
							onBlur={field.onBlur}
						/>
						{(errors.name?.message ?? serverErrors.name) && (
							<p className="field-error">
								{errors.name?.message ?? serverErrors.name}
							</p>
						)}
					</div>
				)}
			/>
			<Controller
				control={control}
				name="email"
				render={({ field }) => (
					<div className="contact-field">
						<jb-input
							name="email"
							type="email"
							label="Email"
							autocomplete="email"
							value={field.value}
							disabled={disabled}
							onInput={(e) => {
								field.onChange((e.target as HTMLInputElement).value);
								clearServerError('email');
							}}
							onBlur={field.onBlur}
						/>
						{(errors.email?.message ?? serverErrors.email) && (
							<p className="field-error">
								{errors.email?.message ?? serverErrors.email}
							</p>
						)}
					</div>
				)}
			/>
			<Controller
				control={control}
				name="message"
				render={({ field }) => (
					<div className="contact-field">
						<jb-textarea
							name="message"
							label="Message"
							value={field.value}
							disabled={disabled}
							onInput={(e) => {
								field.onChange((e.target as HTMLTextAreaElement).value);
								clearServerError('message');
							}}
							onBlur={field.onBlur}
						/>
						{(errors.message?.message ?? serverErrors.message) && (
							<p className="field-error">
								{errors.message?.message ?? serverErrors.message}
							</p>
						)}
					</div>
				)}
			/>
			<button type="submit" className="btn" disabled={disabled}>
				Send
			</button>
		</form>
	);
}
