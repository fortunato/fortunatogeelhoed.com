import { expect, test } from '@playwright/test';

// The shared navigation-motion sequence: every in-app navigation (link click and back/forward
// alike) smooth-scrolls to the top and then plays the destination's entrance. Home plays its
// signature staggered hero entrance; every other page plays the unified whole-main fade-up. The
// markers are baked into the prerender, so this holds across React, Vue, and Angular identically.

const ORIGIN = 'http://localhost:3000';
const FRAMEWORKS = ['react', 'vue', 'angular'] as const;

// Wait until the window has settled at the top after a smooth scroll (or instant jump).
async function waitAtTop(page: import('@playwright/test').Page) {
	await page.waitForFunction(() => window.scrollY <= 2, undefined, { timeout: 3000 });
}

for (const framework of FRAMEWORKS) {
	test.describe(`navigation entrance — ${framework}`, () => {
		test.beforeEach(async ({ context }) => {
			await context.addCookies([{ name: 'framework', value: framework, url: ORIGIN }]);
		});

		test('Home bakes the hero stagger markers and the unified fade is suppressed there', async ({
			page,
		}) => {
			await page.goto('/');
			const main = page.locator('main[data-nav-enter]');
			await expect(main).toHaveCount(1);
			// The hero owns the staggered entrance: four [data-enter] markers and the [data-hero] flag.
			await expect(page.locator('[data-hero]')).toHaveCount(1);
			for (const n of [1, 2, 3, 4]) {
				await expect(page.locator(`[data-enter="${n}"]`)).toHaveCount(1);
			}
		});

		test('a non-hero page has no stagger markers (unified fade owns it)', async ({ page }) => {
			await page.goto('/career');
			await expect(page.locator('main[data-nav-enter]')).toHaveCount(1);
			await expect(page.locator('[data-hero]')).toHaveCount(0);
			await expect(page.locator('[data-enter]')).toHaveCount(0);
		});

		test('navigating to Home smooth-scrolls to the top, then replays the entrance', async ({
			page,
		}) => {
			await page.goto('/career');
			// Push down so the scroll-to-top is observable.
			await page.evaluate(() => window.scrollTo(0, 600));
			await page.waitForFunction(() => window.scrollY > 100);

			await page.getByRole('link', { name: 'Home' }).first().click();
			await expect(page).toHaveURL(/\/$/);
			await waitAtTop(page);

			// The entrance attribute is (re)set on <main>, and the hero markers are present and visible.
			await expect(page.locator('main[data-nav-enter]')).toHaveCount(1);
			const name = page.locator('[data-enter="2"]');
			await expect(name).toBeVisible();
			await expect(name).toHaveCSS('opacity', '1');
		});

		test('back/forward smooth-scrolls to the top and replays the entrance', async ({
			page,
		}) => {
			await page.goto('/');
			await page.getByRole('link', { name: 'Career' }).first().click();
			await expect(page).toHaveURL(/\/career$/);
			await waitAtTop(page);

			// Scroll down on the timeline, then go back — the entrance should replay at the top.
			await page.evaluate(() => window.scrollTo(0, 500));
			await page.waitForFunction(() => window.scrollY > 100);

			await page.goBack();
			await expect(page).toHaveURL(/\/$/);
			await waitAtTop(page);
			await expect(page.locator('main[data-nav-enter]')).toHaveCount(1);
			await expect(page.locator('[data-enter="2"]')).toBeVisible();

			// Forward returns to the timeline, also at the top.
			await page.goForward();
			await expect(page).toHaveURL(/\/career$/);
			await waitAtTop(page);
		});

		test('reduced motion: navigation is instant and content visible', async ({ browser }) => {
			const context = await browser.newContext({ reducedMotion: 'reduce' });
			await context.addCookies([{ name: 'framework', value: framework, url: ORIGIN }]);
			const page = await context.newPage();
			await page.goto('/career');
			await page.evaluate(() => window.scrollTo(0, 600));
			await page.getByRole('link', { name: 'Home' }).first().click();
			await expect(page).toHaveURL(/\/$/);
			await waitAtTop(page);
			const name = page.locator('[data-enter="2"]');
			await expect(name).toBeVisible();
			await expect(name).toHaveCSS('opacity', '1');
			await context.close();
		});

		test('first paint with no JS shows hero content visible', async ({ browser }) => {
			const context = await browser.newContext({ javaScriptEnabled: false });
			await context.addCookies([{ name: 'framework', value: framework, url: ORIGIN }]);
			const page = await context.newPage();
			await page.goto('/');
			await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
			await expect(page.locator('[data-enter="2"]')).toHaveCSS('opacity', '1');
			await context.close();
		});
	});
}
