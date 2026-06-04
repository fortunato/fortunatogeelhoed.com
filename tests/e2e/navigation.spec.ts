import { expect, test } from '@playwright/test';

// Primary navigation, verified end-to-end against the production server: every
// destination resolves, the active item is marked, the mobile bottom tab bar exposes
// all three, and the framework switcher stays available.
const ORIGIN = 'http://localhost:3000';
const FRAMEWORKS = ['react', 'vue', 'angular'] as const;
const NAV = [
	{ label: 'Home', path: '/' },
	{ label: 'Timeline', path: '/timeline' },
	{ label: 'Contact', path: '/contact' },
];

test.describe('primary navigation', () => {
	for (const framework of FRAMEWORKS) {
		test(`reaches every primary destination in ${framework}`, async ({ browser }) => {
			const context = await browser.newContext();
			await context.addCookies([{ name: 'framework', value: framework, url: ORIGIN }]);
			const page = await context.newPage();
			for (const item of NAV) {
				const response = await page.goto(item.path);
				expect(response?.ok()).toBe(true);
				await expect(page.locator('main')).toBeVisible();
				await expect(page.locator('html')).toHaveAttribute('data-framework', framework);
			}
			await context.close();
		});
	}

	test('exposes a mobile bottom tab bar with the three destinations', async ({ browser }) => {
		const context = await browser.newContext({ viewport: { width: 390, height: 800 } });
		const page = await context.newPage();
		await page.goto('/');
		const bottomNav = page.locator('nav[aria-label="Primary"]');
		await expect(bottomNav).toBeVisible();
		for (const item of NAV) {
			await expect(bottomNav.getByRole('link', { name: item.label })).toBeVisible();
		}
		await context.close();
	});

	test('marks the current destination as active', async ({ page }) => {
		await page.goto('/timeline');
		await expect(
			page.locator('a[aria-current="page"]', { hasText: 'Timeline' }).first(),
		).toBeAttached();
	});

	test('keeps the framework switcher available', async ({ page }) => {
		await page.goto('/timeline');
		await expect(page.locator('a[href="/__switch?to=vue"]')).toBeVisible();
	});
});
