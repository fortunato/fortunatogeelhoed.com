import { type ContactFormData, contactSchema } from '@fg/shared/validation/contact';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface ContactFormProps {
	// Disables every control — used while a submission is in flight and by the showcase.
	disabled?: boolean;
}

const FIELDS = ['name', 'email', 'message'] as const;

// Contact form composite built with react-hook-form. A single Zod schema — shared with the
// Vue and Angular forms and with the server that receives the submission — drives validation
// through zodResolver, so the rules live in one place. <Controller> bridges each <jb-*> web
// component (controlled via its `value` property and bubbling native `input` event) to a field.
export function ContactForm({ disabled = false }: ContactFormProps) {
	const [sent, setSent] = useState(false);
	// True when a valid submission could not be delivered (a 502, or the request never reached the
	// server). Surfaces a general "try again" message rather than a false success.
	const [failed, setFailed] = useState(false);
	// Honeypot: a hidden field no human fills. Sent with the payload; the server silently drops any
	// submission that arrives with it set. Kept out of the shared schema so it stays a private trap.
	const [company, setCompany] = useState('');

	const {
		control,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<ContactFormData>({
		resolver: zodResolver(contactSchema),
		defaultValues: { name: '', email: '', message: '' },
		mode: 'onTouched',
	});

	// The server re-validates with the same schema and is authoritative. Map any 4xx field errors
	// back onto react-hook-form's own error state via setError; they clear automatically when the
	// field re-validates on the next edit (reValidateMode defaults to 'onChange').
	const onSubmit = handleSubmit(async (data) => {
		setFailed(false);
		let res: Response;
		try {
			res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ ...data, company }),
			});
		} catch {
			// Never reached the server (offline, aborted) — show the general failure.
			setFailed(true);
			return;
		}
		if (res.ok) {
			setSent(true);
			return;
		}
		// A 422 carries field errors to map back onto the inputs; a 502 (valid but undelivered) or
		// any other failure has none, so it surfaces as a general "try again" message.
		const body = (await res.json().catch(() => null)) as {
			errors?: Partial<Record<keyof ContactFormData, string[]>>;
		} | null;
		let hadFieldError = false;
		for (const field of FIELDS) {
			const message = body?.errors?.[field]?.[0];
			if (message) {
				setError(field, { type: 'server', message });
				hadFieldError = true;
			}
		}
		if (!hadFieldError) setFailed(true);
	});

	if (sent) {
		return <output className="contact-success">Thanks, I'll be in touch shortly.</output>;
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
							onInput={(e) => field.onChange((e.target as HTMLInputElement).value)}
							onBlur={field.onBlur}
						/>
						{errors.name?.message && (
							<p className="field-error">{errors.name.message}</p>
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
							onInput={(e) => field.onChange((e.target as HTMLInputElement).value)}
							onBlur={field.onBlur}
						/>
						{errors.email?.message && (
							<p className="field-error">{errors.email.message}</p>
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
							onInput={(e) => field.onChange((e.target as HTMLTextAreaElement).value)}
							onBlur={field.onBlur}
						/>
						{errors.message?.message && (
							<p className="field-error">{errors.message.message}</p>
						)}
					</div>
				)}
			/>
			<div className="contact-hp" aria-hidden="true">
				<input
					type="text"
					name="company"
					tabIndex={-1}
					autoComplete="off"
					value={company}
					onChange={(e) => setCompany(e.target.value)}
				/>
			</div>
			{failed && (
				<p className="contact-error" role="alert">
					Something went wrong sending your message. Please try again.
				</p>
			)}
			<p className="contact-privacy">
				Your name, email, and message are emailed to me so I can reply — they are not stored
				on this site.
			</p>
			<button type="submit" className="btn btn--marketing" disabled={disabled}>
				Send
			</button>
		</form>
	);
}
