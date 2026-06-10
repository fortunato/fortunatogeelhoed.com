import { registerElements } from '@fg/shared/elements';
import { fireEvent, render, screen } from '@testing-library/angular';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactFormComponent } from './contact-form.component';

// Contact form behaviour, in a real browser via TestBed so the jb-input/jb-textarea custom
// elements upgrade and the JbControlValueAccessor observes real input events. Mirrors the React
// and Vue ContactForm tests so the same four behaviours (client validation, successful submit,
// server 422 field mapping, and the success/failure UI swap) are proven across all three.
beforeAll(() => registerElements());

// The shared jb-* elements take `name` as a property (not a reflected attribute) and render the
// inner control with id `jb-<name>`, so the control is addressed by that id across all frameworks.
const controlFor = (name: string): HTMLInputElement | HTMLTextAreaElement => {
	const control = document.getElementById(`jb-${name}`);
	if (!control) throw new Error(`no control for field "${name}"`);
	return control as HTMLInputElement | HTMLTextAreaElement;
};

async function typeInto(name: string, value: string): Promise<void> {
	const control = controlFor(name);
	const host = control.closest('jb-input, jb-textarea') as
		| (HTMLElement & { value: string })
		| null;
	control.value = value;
	// The custom element mirrors the inner control's value onto the host; set it directly too so
	// the value-accessor reads the host value the moment the event bubbles.
	if (host) host.value = value;
	await fireEvent.input(control, { target: { value } });
}

async function blur(name: string): Promise<void> {
	await fireEvent.blur(controlFor(name));
}

async function fillValid(): Promise<void> {
	await typeInto('name', 'Ada Lovelace');
	await typeInto('email', 'ada@example.com');
	await typeInto('message', 'I would like to discuss a role.');
}

async function submit(): Promise<void> {
	const form = screen.getByRole('button', { name: 'Send' }).closest('form') as HTMLFormElement;
	await fireEvent.submit(form);
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
	fetchMock = vi.fn();
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('ContactFormComponent (Angular)', () => {
	it('shows client-side validation errors and does not submit', async () => {
		await render(ContactFormComponent);
		await screen.findByRole('button', { name: 'Send' });

		await submit();

		await screen.findByText('Name is required');
		expect(screen.getByText('Enter a valid email')).toBeTruthy();
		expect(screen.getByText('Message is required')).toBeTruthy();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('submits a valid payload to /api/contact and swaps to the success view', async () => {
		fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
		await render(ContactFormComponent);
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
		await render(ContactFormComponent);
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
		await render(ContactFormComponent);
		await screen.findByRole('button', { name: 'Send' });

		await fillValid();
		await submit();

		const alert = await screen.findByRole('alert');
		expect(alert.textContent).toContain('Something went wrong sending your message');
		expect(screen.queryByText("Thanks, I'll be in touch shortly.")).toBeNull();
	});

	it('shows the general failure alert when the request never reaches the server', async () => {
		fetchMock.mockRejectedValue(new TypeError('network down'));
		await render(ContactFormComponent);
		await screen.findByRole('button', { name: 'Send' });

		await fillValid();
		await submit();

		const alert = await screen.findByRole('alert');
		expect(alert.textContent).toContain('Something went wrong sending your message');
	});
});
