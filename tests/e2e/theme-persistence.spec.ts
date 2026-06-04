import { expect, test } from '@playwright/test';

// Theme persistence, end-to-end. The server paints the prerendered <html data-theme> from
// the `theme` cookie, so the correct theme is present in the very first response (no flash),
// and it must survive a reload and a framework switch.
const ORIGIN = 'http://localhost:3000';

test('theme persists across reload and a framework switch with no wrong-theme flash', async ({
	browser,
}) => {
	const context = await browser.newContext();
	await context.addCookies([
		{ name: 'theme', value: 'light', url: ORIGIN },
		{ name: 'framework', value: 'react', url: ORIGIN },
	]);
	const page = await context.newPage();

	// First paint already carries the chosen theme (server-rendered) — this is the no-flash guarantee.
	await page.goto('/');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

	// Switch framework; the theme choice must carry over.
	await page.goto('/__switch?to=vue');
	await page.goto('/');
	await expect(page.locator('html')).toHaveAttribute('data-framework', 'vue');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

	await context.close();
});
