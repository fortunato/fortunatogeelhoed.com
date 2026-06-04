import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { registerElements } from './index';
import type { JbThemeToggle } from './jb-theme-toggle';

beforeAll(() => registerElements());

afterEach(() => {
	document.documentElement.removeAttribute('data-theme');
	document.cookie = 'theme=;path=/;max-age=0';
	localStorage.clear();
});

async function mount(): Promise<JbThemeToggle> {
	const el = document.createElement('jb-theme-toggle') as JbThemeToggle;
	document.body.append(el);
	await el.updateComplete;
	return el;
}

describe('jb-theme-toggle', () => {
	it('exposes an accessible toggle button', async () => {
		const el = await mount();
		const button = el.querySelector('button');
		expect(button?.getAttribute('aria-label')).toBe('Toggle color theme');
		el.remove();
	});

	it('flips the document theme and persists it on click', async () => {
		document.documentElement.setAttribute('data-theme', 'dark');
		const el = await mount();
		el.querySelector('button')?.click();
		expect(document.documentElement.getAttribute('data-theme')).toBe('light');
		expect(document.cookie).toContain('theme=light');
		el.remove();
	});
});
