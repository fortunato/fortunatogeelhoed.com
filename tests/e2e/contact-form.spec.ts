import { expect, test } from '@playwright/test';

// Contact form, end-to-end against the production server in every framework variant. The real
// mail backend is not configured in test, so the POST to /api/contact is intercepted at the
// network layer: this proves the whole client path (fill, validate, submit, render the outcome)
// without depending on a live mailer. A happy path swaps to the confirmation; a server failure
// surfaces the alert and keeps the form.
const ORIGIN = 'http://localhost:3000';
const FRAMEWORKS = ['react', 'vue', 'angular'] as const;

const VALID = {
	name: 'Ada Lovelace',
	email: 'ada@example.com',
	message: 'I would like to discuss a frontend role.',
};

// Fill the three jb-* fields through their inner control. The shared element renders the control
// client-side with id `jb-<name>` (the host `name` is a property after hydration, not a stable
// attribute), so addressing by that id is reliable across all three frameworks. Filling it fires
// the input event the form binding listens for.
async function fillForm(page: import('@playwright/test').Page): Promise<void> {
	await page.locator('#jb-name').fill(VALID.name);
	await page.locator('#jb-email').fill(VALID.email);
	await page.locator('#jb-message').fill(VALID.message);
}

test.describe('contact form', () => {
	for (const framework of FRAMEWORKS) {
		test(`delivers a valid submission and confirms in ${framework}`, async ({ browser }) => {
			const context = await browser.newContext();
			await context.addCookies([{ name: 'framework', value: framework, url: ORIGIN }]);
			const page = await context.newPage();

			let received: Record<string, unknown> | null = null;
			await page.route('**/api/contact', async (route) => {
				received = route.request().postDataJSON();
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ ok: true }),
				});
			});

			await page.goto('/contact');
			await expect(page.locator('form.contact-form')).toBeVisible();

			await fillForm(page);
			await page.getByRole('button', { name: 'Send' }).click();

			await expect(page.locator('.contact-success')).toHaveText(
				"Thanks, I'll be in touch shortly.",
			);
			await expect(page.getByRole('button', { name: 'Send' })).toHaveCount(0);
			expect(received).toMatchObject(VALID);

			await context.close();
		});

		test(`surfaces an error alert when delivery fails in ${framework}`, async ({ browser }) => {
			const context = await browser.newContext();
			await context.addCookies([{ name: 'framework', value: framework, url: ORIGIN }]);
			const page = await context.newPage();

			await page.route('**/api/contact', async (route) => {
				await route.fulfill({
					status: 502,
					contentType: 'application/json',
					body: JSON.stringify({ error: 'delivery_failed' }),
				});
			});

			await page.goto('/contact');
			await expect(page.locator('form.contact-form')).toBeVisible();

			await fillForm(page);
			await page.getByRole('button', { name: 'Send' }).click();

			const alert = page.getByRole('alert');
			await expect(alert).toBeVisible();
			await expect(alert).toContainText('Something went wrong sending your message');
			// The form stays put so the visitor can retry.
			await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();

			await context.close();
		});
	}
});
