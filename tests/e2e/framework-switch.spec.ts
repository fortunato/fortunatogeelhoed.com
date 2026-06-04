import { expect, test } from '@playwright/test';

// The cookie-routed framework switch, verified end-to-end against the production server.
// The served variant is reported on <html data-framework>, which the server sets per request.
const ORIGIN = 'http://localhost:3000';
const FRAMEWORKS = ['react', 'vue', 'angular'] as const;

test.describe('framework switch', () => {
	for (const framework of FRAMEWORKS) {
		test(`serves the ${framework} variant when it is selected`, async ({ browser }) => {
			const context = await browser.newContext();
			await context.addCookies([{ name: 'framework', value: framework, url: ORIGIN }]);
			const page = await context.newPage();
			await page.goto('/');
			await expect(page.locator('html')).toHaveAttribute('data-framework', framework);
			await context.close();
		});
	}

	test('defaults to react when no framework is selected', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('html')).toHaveAttribute('data-framework', 'react');
	});

	test('defaults to react when the selection is unrecognised', async ({ browser }) => {
		const context = await browser.newContext();
		await context.addCookies([{ name: 'framework', value: 'svelte', url: ORIGIN }]);
		const page = await context.newPage();
		await page.goto('/');
		await expect(page.locator('html')).toHaveAttribute('data-framework', 'react');
		await context.close();
	});

	test('the switch endpoint changes the served variant', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('html')).toHaveAttribute('data-framework', 'react');
		await page.goto('/__switch?to=vue');
		await page.goto('/');
		await expect(page.locator('html')).toHaveAttribute('data-framework', 'vue');
	});
});
