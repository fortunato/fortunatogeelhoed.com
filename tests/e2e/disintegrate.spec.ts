import { expect, test } from '@playwright/test';

// The cross-framework transition must honour reduced motion: under prefers-reduced-motion the
// switch falls back to a plain navigation (no particle animation) and the incoming page is
// never left in the hidden/animating state — it reaches its final, visible result.
const ORIGIN = 'http://localhost:3000';

test('switch under reduced motion reaches the final state without lingering hidden', async ({
	browser,
}) => {
	const context = await browser.newContext({ reducedMotion: 'reduce' });
	await context.addCookies([{ name: 'framework', value: 'react', url: ORIGIN }]);
	const page = await context.newPage();
	await page.goto('/');

	// Reduced motion → the switcher link is a plain navigation (no preventDefault/shred).
	await page.getByText('vue', { exact: true }).click();
	await page.waitForLoadState('networkidle');

	await expect(page.locator('html')).toHaveAttribute('data-framework', 'vue');
	// The reassemble path is skipped, so the document is not stuck at opacity 0.
	const opacity = await page.evaluate(() => document.documentElement.style.opacity);
	expect(opacity === '' || opacity === '1').toBe(true);

	await context.close();
});
