import { registerElements } from '@fg/shared/elements';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactForm } from './ContactForm';

// Contact form behaviour, in a real browser so the jb-input/jb-textarea custom elements upgrade
// and emit real input events. Mirrors the Vue and Angular ContactForm tests so the same four
// behaviours (client validation, successful submit, server 422 field mapping, and the
// success/failure UI swap) are proven identically across all three frameworks.
beforeAll(() => registerElements());

// The shared jb-* elements take `name` as a property (not a reflected attribute) and render the
// inner control with id `jb-<name>`, so the control is addressed by that id across all frameworks.
const controlFor = (name: string): HTMLInputElement | HTMLTextAreaElement => {
	const control = document.getElementById(`jb-${name}`);
	if (!control) throw new Error(`no control for field "${name}"`);
	return control as HTMLInputElement | HTMLTextAreaElement;
};

function typeInto(name: string, value: string): void {
	const control = controlFor(name);
	control.value = value;
	fireEvent.input(control, { target: { value } });
}

function blur(name: string): void {
	fireEvent.blur(controlFor(name));
}

function fillValid(): void {
	typeInto('name', 'Ada Lovelace');
	typeInto('email', 'ada@example.com');
	typeInto('message', 'I would like to discuss a role.');
}

function submit(): void {
	fireEvent.submit(
		screen.getByRole('button', { name: 'Send' }).closest('form') as HTMLFormElement,
	);
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
	fetchMock = vi.fn();
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe('ContactForm (React)', () => {
	it('shows client-side validation errors and does not submit', async () => {
		render(<ContactForm />);
		await screen.findByRole('button', { name: 'Send' });

		// Touch then leave each field empty/invalid to trigger onTouched validation.
		blur('name');
		typeInto('email', 'not-an-email');
		blur('email');
		blur('message');
		submit();

		await screen.findByText('Name is required');
		expect(screen.getByText('Enter a valid email')).toBeTruthy();
		expect(screen.getByText('Message is required')).toBeTruthy();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('submits a valid payload to /api/contact and swaps to the success view', async () => {
		fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
		render(<ContactForm />);
		await screen.findByRole('button', { name: 'Send' });

		fillValid();
		submit();

		await screen.findByText("Thanks, I'll be in touch shortly.");
		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toBe('/api/contact');
		expect(init.method).toBe('POST');
		expect(JSON.parse(init.body as string)).toMatchObject({
			name: 'Ada Lovelace',
			email: 'ada@example.com',
			message: 'I would like to discuss a role.',
			company: '',
		});
		// The form is replaced by the confirmation, so the Send button is gone.
		expect(screen.queryByRole('button', { name: 'Send' })).toBeNull();
	});

	it('maps server 422 field errors back onto the matching inputs', async () => {
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ errors: { email: ['Email already on the list'] } }), {
				status: 422,
			}),
		);
		render(<ContactForm />);
		await screen.findByRole('button', { name: 'Send' });

		fillValid();
		submit();

		await screen.findByText('Email already on the list');
		// A mapped field error is not the general failure banner.
		expect(screen.queryByRole('alert')).toBeNull();
		// Still on the form, not the success view.
		expect(screen.getByRole('button', { name: 'Send' })).toBeTruthy();
	});

	it('shows the general failure alert when delivery fails without field errors', async () => {
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ error: 'delivery_failed' }), { status: 502 }),
		);
		render(<ContactForm />);
		await screen.findByRole('button', { name: 'Send' });

		fillValid();
		submit();

		const alert = await screen.findByRole('alert');
		expect(alert.textContent).toContain('Something went wrong sending your message');
		expect(screen.queryByText("Thanks, I'll be in touch shortly.")).toBeNull();
	});

	it('shows the general failure alert when the request never reaches the server', async () => {
		fetchMock.mockRejectedValue(new TypeError('network down'));
		render(<ContactForm />);
		await screen.findByRole('button', { name: 'Send' });

		fillValid();
		submit();

		const alert = await screen.findByRole('alert');
		expect(alert.textContent).toContain('Something went wrong sending your message');
	});
});
