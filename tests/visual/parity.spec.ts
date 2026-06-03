import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

// Accent normalization so the comparison ignores the per-framework accent (a legitimate
// difference) and compares everything else.
const neutralAccent = readFileSync(resolve(import.meta.dirname, 'neutral-accent.css'), 'utf8');

// The same composite, authored in each framework. All three compare against ONE shared
// baseline ('contact-form'), so if any framework's rendering drifts from the others the
// build fails — the cross-framework parity gate.
const sections = [
	{ framework: 'React', id: 'react-contact-form--default', base: '/react' },
	{ framework: 'Vue', id: 'vue-contact-form--default', base: '/vue' },
	{ framework: 'Angular', id: 'angular-contact-form--default', base: '/angular' },
];

for (const section of sections) {
	test(`Contact Form parity — ${section.framework}`, async ({ page }) => {
		await page.goto(`${section.base}/iframe.html?id=${section.id}&viewMode=story&globals=theme:dark`);
		const form = page.locator('.contact-form');
		await form.waitFor({ state: 'visible' });
		await page.addStyleTag({ content: neutralAccent });
		await page.evaluate(() => document.fonts.ready);
		await expect(form).toHaveScreenshot('contact-form.png');
	});
}
