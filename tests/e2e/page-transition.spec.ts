import { expect, test } from '@playwright/test';

// The home ↔ timeline page transition and its progressive-enhancement guarantees.
// In-app navigation smooth-scrolls to the top and then plays the destination's entrance;
// that motion is visual, so what we assert here is the contract around it: navigation
// updates the URL and swaps content, and everything still works under reduced motion and
// with scripting disabled.

test.describe('home ↔ timeline transition', () => {
	test('navigates between home and timeline, updating the URL', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Fortunato');

		await page.getByRole('link', { name: 'Career' }).first().click();
		await expect(page).toHaveURL(/\/career$/);
		await expect(page.getByRole('heading', { name: /Twenty-five years/ })).toBeVisible();

		await page.getByRole('link', { name: 'Home' }).first().click();
		await expect(page).toHaveURL(/\/$/);
	});

	test('still navigates with reduced motion', async ({ browser }) => {
		const context = await browser.newContext({ reducedMotion: 'reduce' });
		const page = await context.newPage();
		await page.goto('/');
		await page.getByRole('link', { name: 'Career' }).first().click();
		await expect(page).toHaveURL(/\/career$/);
		await expect(page.getByRole('heading', { name: /Twenty-five years/ })).toBeVisible();
		await context.close();
	});

	test('serves full content with scripting disabled', async ({ browser }) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();

		await page.goto('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Fortunato');
		await expect(page.getByRole('link', { name: 'Career' }).first()).toBeVisible();

		// The timeline route resolves and is fully pre-rendered without JS.
		await page.goto('/career');
		await expect(page.getByRole('heading', { name: /Twenty-five years/ })).toBeVisible();
		await expect(page.getByText('Gemeente Amsterdam')).toBeVisible();
		await context.close();
	});
});
