import { LitElement, html } from 'lit';
import { toggleTheme } from '../theme';

// Moon/sun theme toggle, shared by all three headers (previously duplicated SVG markup
// in each). Light DOM so the global `[data-theme="light"] .sun/.moon` icon-swap rules —
// which depend on the ancestor attribute on <html> — keep working; a shadow boundary
// would hide that ancestor from the icons. Click delegates to the shared toggleTheme(),
// which flips <html data-theme>, the cookie, and localStorage.
/**
 * @customElement jb-theme-toggle
 */
export class JbThemeToggle extends LitElement {
	createRenderRoot() {
		return this;
	}

	render() {
		return html`
			<button
				type="button"
				class="theme-toggle"
				aria-label="Toggle color theme"
				@click=${() => toggleTheme()}
			>
				<svg
					class="moon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
				</svg>
				<svg
					class="sun"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="4" />
					<path
						d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
					/>
				</svg>
			</button>
		`;
	}
}
