import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCurrentTheme, setTheme, toggleTheme } from './theme';

// theme.ts touches document, cookie, and localStorage but is not a component, so it runs
// in happy-dom. We assert the three persistence channels stay in sync and that a blocked
// localStorage (private mode) degrades gracefully to the cookie.
afterEach(() => {
	document.documentElement.removeAttribute('data-theme');
	document.cookie = 'theme=;path=/;max-age=0';
	localStorage.clear();
	vi.restoreAllMocks();
});

describe('theme persistence', () => {
	it('defaults to light when no theme attribute is set', () => {
		expect(getCurrentTheme()).toBe('light');
	});

	it('reflects and persists a theme across attribute, cookie, and storage', () => {
		setTheme('light');
		expect(document.documentElement.getAttribute('data-theme')).toBe('light');
		expect(getCurrentTheme()).toBe('light');
		expect(document.cookie).toContain('theme=light');
		expect(localStorage.getItem('theme')).toBe('light');
	});

	it('toggles dark↔light and returns the new theme', () => {
		setTheme('dark');
		expect(toggleTheme()).toBe('light');
		expect(getCurrentTheme()).toBe('light');
		expect(toggleTheme()).toBe('dark');
	});

	it('still persists via cookie when localStorage is unavailable', () => {
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('storage blocked');
		});
		vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
			throw new Error('storage blocked');
		});
		expect(() => setTheme('light')).not.toThrow();
		expect(document.documentElement.getAttribute('data-theme')).toBe('light');
		expect(document.cookie).toContain('theme=light');
	});
});
