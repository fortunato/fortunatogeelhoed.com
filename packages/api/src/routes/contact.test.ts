import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { contactRoute } from './contact';

// The provider call is mocked here: these tests cover the route's behaviour — validation, the
// honeypot, and fail-closed delivery — not the live email send (that path is exercised manually).
const sendContactEmail = vi.hoisted(() => vi.fn());
vi.mock('../services/email', () => ({ sendContactEmail }));

// Drive the route module in isolation (no global middleware), so this covers the handler + its
// validation wiring directly.
async function post(body: unknown): Promise<Response> {
	const app = new Hono();
	app.post('/', ...contactRoute);
	return app.request('/', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
}

describe('contact route', () => {
	beforeEach(() => {
		sendContactEmail.mockReset();
		sendContactEmail.mockResolvedValue({ ok: true });
	});

	it('accepts a well-formed submission and delivers it', async () => {
		const res = await post({ name: 'Ada', email: 'ada@example.com', message: 'hello' });
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
		expect(sendContactEmail).toHaveBeenCalledTimes(1);
	});

	it('returns 502 when a valid submission cannot be delivered', async () => {
		// Fail closed: the visitor must learn it did not go through, not see a false success.
		sendContactEmail.mockResolvedValue({ ok: false, reason: 'upstream' });
		const res = await post({ name: 'Ada', email: 'ada@example.com', message: 'hello' });
		expect(res.status).toBe(502);
		expect(await res.json()).toEqual({ error: 'delivery_failed' });
	});

	it('rejects an invalid submission with field-keyed errors and sends nothing', async () => {
		const res = await post({ name: '', email: 'not-an-email', message: '' });
		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(Object.keys(body.errors).sort()).toEqual(['email', 'message', 'name']);
		expect(sendContactEmail).not.toHaveBeenCalled();
	});

	it('rejects a non-JSON body', async () => {
		const app = new Hono();
		app.post('/', ...contactRoute);
		const res = await app.request('/', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: 'not json',
		});
		expect(res.status).toBe(422);
		expect(sendContactEmail).not.toHaveBeenCalled();
	});

	it('silently accepts and drops a submission that fills the honeypot, without sending', async () => {
		const res = await post({
			name: 'Ada',
			email: 'ada@example.com',
			message: 'hello',
			company: 'Acme Spam Co',
		});
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
		expect(sendContactEmail).not.toHaveBeenCalled();
	});

	it('short-circuits before validation when the honeypot is filled', async () => {
		// Invalid fields would normally be a 422; the honeypot must win first, returning a silent 200
		// so the bot never learns the trap exists.
		const res = await post({ name: '', email: 'nope', message: '', company: 'bot' });
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
		expect(sendContactEmail).not.toHaveBeenCalled();
	});

	it('accepts a normal submission whose honeypot is empty', async () => {
		const res = await post({
			name: 'Ada',
			email: 'ada@example.com',
			message: 'hello',
			company: '',
		});
		expect(res.status).toBe(200);
		expect(sendContactEmail).toHaveBeenCalledTimes(1);
	});
});
