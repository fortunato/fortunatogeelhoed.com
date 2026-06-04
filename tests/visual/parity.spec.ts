import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

// Accent normalization so the comparison ignores the per-framework accent (a legitimate
// difference) and compares everything else.
const neutralAccent = readFileSync(resolve(import.meta.dirname, 'neutral-accent.css'), 'utf8');

const FRAMEWORKS = ['react', 'vue', 'angular'] as const;

// Each composite is authored once per framework. All three compare against ONE shared
// baseline, so if any framework's rendering drifts from the others the build fails — the
// cross-framework parity gate. `mask` hides legitimately framework-specific regions (the
// switcher highlights the *current* framework, so it differs by design).
const COMPONENTS = [
	{
		name: 'Contact Form',
		story: 'contact-form',
		baseline: 'contact-form.png',
		locator: '.contact-form',
		mask: [] as string[],
		reducedMotion: false,
	},
	{
		name: 'Header',
		story: 'header',
		baseline: 'header.png',
		locator: 'header',
		mask: ['a[href^="/__switch"]'],
		reducedMotion: false,
	},
	// Whole-page parity subjects. Both reveal their content as it scrolls into view, so we
	// emulate reduced motion to pin every section to its final (visible) state — the page is
	// then deterministic and the three frameworks compare against one baseline.
	{
		name: 'Homepage',
		story: 'home',
		baseline: 'home.png',
		locator: '#storybook-root',
		mask: [] as string[],
		reducedMotion: true,
	},
	{
		name: 'Timeline',
		story: 'timeline',
		baseline: 'timeline.png',
		locator: '#storybook-root',
		mask: [] as string[],
		reducedMotion: true,
	},
];

for (const component of COMPONENTS) {
	for (const framework of FRAMEWORKS) {
		test(`${component.name} parity — ${framework}`, async ({ page }) => {
			if (component.reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
			await page.goto(
				`/${framework}/iframe.html?id=${framework}-${component.story}--default&viewMode=story&globals=theme:dark`,
			);
			const el = page.locator(component.locator).first();
			await el.waitFor({ state: 'visible' });
			await page.addStyleTag({ content: neutralAccent });
			await page.evaluate(() => document.fonts.ready);
			await expect(el).toHaveScreenshot(component.baseline, {
				mask: component.mask.map((selector) => page.locator(selector)),
			});
		});
	}
}
