import { type FormEvent, useState } from 'react';
import { useContent } from '../content';

export function Contact() {
	const content = useContent('contact');
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');
	const [sent, setSent] = useState(false);

	// Controlled inputs: each <jb-input> reflects React state via its `value` property
	// and reports edits through the bubbling native `input` event (onInput).
	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// Native constraint validation flows through the form-associated elements.
		if (!e.currentTarget.checkValidity()) {
			e.currentTarget.reportValidity();
			return;
		}
		// Client-only for this slice — backend submission is a later step.
		setSent(true);
	};

	return (
		<section>
			<div className="container">
				<span className="section-label">Available Now</span>
				<h2 className="section-title">{content?.title ?? "Let's work together."}</h2>
				<p style={{ color: 'var(--jb-text-secondary)' }}>
					{content?.body ??
						'Get in touch for consulting, freelance projects, or collaboration.'}
				</p>

				{sent ? (
					<output className="contact-success">Thanks — I'll be in touch shortly.</output>
				) : (
					<form onSubmit={onSubmit} noValidate className="contact-form">
						<jb-input
							name="name"
							label="Name"
							value={name}
							onInput={(e) => setName((e.target as HTMLInputElement).value)}
							required
						/>
						<jb-input
							name="email"
							type="email"
							label="Email"
							autocomplete="email"
							value={email}
							onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
							required
						/>
						<jb-textarea
							name="message"
							label="Message"
							value={message}
							onInput={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
							required
						/>
						<button type="submit" className="btn">
							Send
						</button>
					</form>
				)}

				<p className="contact-meta">
					<jb-tech-tag>React</jb-tech-tag>
					<jb-tech-tag>TypeScript</jb-tech-tag>
					<jb-tech-tag>Vite</jb-tech-tag>
				</p>
			</div>
		</section>
	);
}
