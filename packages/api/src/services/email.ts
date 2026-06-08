import type { ContactFormData } from '@fg/shared/validation/contact';
import { logger } from '../logger';

// Delivers a validated contact submission as an email through AhaSend's HTTPS API. The contact
// form is the site's one conversion path, so this fails *closed*: every error resolves to
// { ok: false } and the route turns that into a 502 the visitor can see and retry, rather than a
// false success that would silently lose a real lead. Nothing is persisted — the message is
// relayed and gone. This is the only place the credential and destination address are read, and
// neither is ever logged.

const API_KEY = process.env.AHASEND_API_KEY;
const ACCOUNT_ID = process.env.AHASEND_ACCOUNT_ID;
const FROM_EMAIL = process.env.AHASEND_FROM_EMAIL;
const TO_EMAIL = process.env.AHASEND_TO_EMAIL;
const FROM_NAME = process.env.AHASEND_FROM_NAME ?? 'fortunatogeelhoed.com';
const ENDPOINT = ACCOUNT_ID ? `https://api.ahasend.com/v2/accounts/${ACCOUNT_ID}/messages` : null;
const TIMEOUT_MS = 5_000;

export type SendResult = { ok: true } | { ok: false; reason: 'unconfigured' | 'upstream' };

export async function sendContactEmail(submission: ContactFormData): Promise<SendResult> {
	if (!API_KEY || !ENDPOINT || !FROM_EMAIL || !TO_EMAIL) {
		// Presence booleans only, never the values. Missing configuration is an operator error, not
		// the visitor's, so it is logged loudly and surfaced as a failure rather than a fake success.
		logger.error(
			{
				hasKey: Boolean(API_KEY),
				hasAccount: Boolean(ACCOUNT_ID),
				hasFrom: Boolean(FROM_EMAIL),
				hasTo: Boolean(TO_EMAIL),
			},
			'contact email is not configured',
		);
		return { ok: false, reason: 'unconfigured' };
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		const res = await fetch(ENDPOINT, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${API_KEY}`,
				'Content-Type': 'application/json',
			},
			signal: controller.signal,
			body: JSON.stringify({
				from: { email: FROM_EMAIL, name: FROM_NAME },
				recipients: [{ email: TO_EMAIL }],
				// Reply-to is the visitor, so replying from the inbox reaches them directly.
				reply_to: { email: submission.email, name: submission.name },
				subject: `Contact form: ${submission.name}`,
				// Plain text only — never interpolate visitor input into HTML. JSON.stringify escapes
				// control characters and the shared schema caps name at 100 chars, so neither the body
				// nor the subject can carry header or markup injection.
				text_content: `From: ${submission.name} <${submission.email}>\n\n${submission.message}`,
			}),
		});

		// AhaSend accepts a message for delivery with 202; anything else is a failure we surface.
		if (res.status !== 202) {
			const detail = await res.text().catch(() => '');
			logger.error(
				{ status: res.status, detail: detail.slice(0, 500) },
				'contact email send failed',
			);
			return { ok: false, reason: 'upstream' };
		}
		logger.info('contact email sent');
		return { ok: true };
	} catch (err) {
		// Timeout (abort) or network failure.
		logger.error({ err: String(err) }, 'contact email request errored');
		return { ok: false, reason: 'upstream' };
	} finally {
		clearTimeout(timeout);
	}
}
