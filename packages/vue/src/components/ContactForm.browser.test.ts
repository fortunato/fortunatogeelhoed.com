import { registerElements } from '@fg/shared/elements';
import { cleanup, render, screen } from '@testing-library/vue';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import ContactForm from './ContactForm.vue';

// Contact form behaviour, in a real browser so the jb-input/jb-textarea custom elements upgrade
// and emit real input events. Mirrors the React and Angular ContactForm tests so the same four
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

// Drive the inner control with native events, exactly as a user would: the jb-* element listens
// for the bubbling `input` and the form binding reads it. A native dispatch avoids Testing
// Library's v-model heuristics, which do not apply to these custom-element bindings.
async function typeInto(name: string, value: string): Promise<void> {
	const control = controlFor(name);
	control.value = value;
	control.dispatchEvent(new Event('input', { bubbles: true }));
	await Promise.resolve();
}

async function blur(name: string): Promise<void> {
	controlFor(name).dispatchEvent(new Event('blur', { bubbles: true }));
	await Promise.resolve();
}

async function fillValid(): Promise<void> {
	await typeInto('name', 'Ada Lovelace');
	await typeInto('email', 'ada@example.com');
	await typeInto('message', 'I would like to discuss a role.');
}

async function submit(): Promise<void> {
	const form = screen.getByRole('button', { name: 'Send' }).closest('form') as HTMLFormElement;
	form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
	await Promise.resolve();
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

describe('ContactForm (Vue)', () => {
	it('shows client-side validation errors and does not submit', async () => {
		render(ContactForm);
		await screen.findByRole('button', { name: 'Send' });

		// Touch each field so the per-field error becomes visible, then submit.
		await blur('name');
		await typeInto('email', 'not-an-email');
		await blur('email');
		await blur('message');
		await submit();

		await screen.findByText('Name is required');
		expect(screen.getByText('Enter a valid email')).toBeTruthy();
		expect(screen.getByText('Message is required')).toBeTruthy();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('submits a valid payload to /api/contact and swaps to the success view', async () => {
		fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
		render(ContactForm);
		await screen.findByRole('button', { name: 'Send' });

		await fillValid();
		await submit();

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
		expect(screen.queryByRole('button', { name: 'Send' })).toBeNull();
	});

	it('maps server 422 field errors back onto the matching inputs', async () => {
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ errors: { email: ['Email already on the list'] } }), {
				status: 422,
			}),
		);
		render(ContactForm);
		await screen.findByRole('button', { name: 'Send' });

		await fillValid();
		await submit();

		await screen.findByText('Email already on the list');
		expect(screen.queryByRole('alert')).toBeNull();
		expect(screen.getByRole('button', { name: 'Send' })).toBeTruthy();
	});

	it('shows the general failure alert when delivery fails without field errors', async () => {
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ error: 'delivery_failed' }), { status: 502 }),
		);
		render(ContactForm);
		await screen.findByRole('button', { name: 'Send' });

		await fillValid();
		await submit();

		const alert = await screen.findByRole('alert');
		expect(alert.textContent).toContain('Something went wrong sending your message');
		expect(screen.queryByText("Thanks, I'll be in touch shortly.")).toBeNull();
	});

	it('shows the general failure alert when the request never reaches the server', async () => {
		fetchMock.mockRejectedValue(new TypeError('network down'));
		render(ContactForm);
		await screen.findByRole('button', { name: 'Send' });

		await fillValid();
		await submit();

		const alert = await screen.findByRole('alert');
		expect(alert.textContent).toContain('Something went wrong sending your message');
	});
});
