// Framework-agnostic theme persistence, shared by all three variants.
// Browser APIs are only touched inside functions (never at module load), so this
// is safe to import in SSR/prerender contexts; the functions run client-side only.

export type Theme = 'dark' | 'light';

const COOKIE = 'theme';
const STORAGE_KEY = 'theme';
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year, mirrors the `framework` cookie

/** Current theme as reflected on <html data-theme>. Defaults to dark. */
export function getCurrentTheme(): Theme {
	return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

/** Apply a theme everywhere it must persist: attribute (paint), cookie (server), localStorage. */
export function setTheme(theme: Theme): void {
	document.documentElement.setAttribute('data-theme', theme);
	document.cookie = `${COOKIE}=${theme};path=/;max-age=${MAX_AGE};samesite=lax`;
	try {
		localStorage.setItem(STORAGE_KEY, theme);
	} catch {
		// localStorage unavailable (private mode / blocked) — cookie still persists.
	}
}

/** Flip dark↔light, persist, and return the new theme. */
export function toggleTheme(): Theme {
	const next: Theme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
	setTheme(next);
	return next;
}
