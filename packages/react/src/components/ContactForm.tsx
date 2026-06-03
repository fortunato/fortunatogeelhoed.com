import { type SubmitEvent, useState } from 'react';

// Self-contained contact form composite — the same form the Contact page uses, built in React.
// Controlled jb-input/jb-textarea: each reflects React state via its `value` property and
// reports edits through the bubbling native `input` event (onInput). Demonstrates real
// framework↔web-component interop, and is the cross-framework visual-parity subject.
export function ContactForm() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');
	const [sent, setSent] = useState(false);

	const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!e.currentTarget.checkValidity()) {
			e.currentTarget.reportValidity();
			return;
		}
		setSent(true);
	};

	if (sent) {
		return <output className="contact-success">Thanks — I'll be in touch shortly.</output>;
	}

	return (
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
	);
}
