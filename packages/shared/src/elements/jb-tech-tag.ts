import { LitElement, css, html } from 'lit';

// Small monospace technology badge. Unlike the form controls and the theme toggle,
// this one uses SHADOW DOM with a <slot> and self-contained styles — a deliberate
// contrast showing the other encapsulation mode. The `--jb-` design tokens are
// inherited custom properties, so they pierce the shadow boundary and keep the badge
// on-palette without any global CSS.
/**
 * Shadow-DOM technology badge with a slotted label, kept on-palette via inherited tokens.
 *
 * @customElement jb-tech-tag
 * @slot - The badge label text.
 */
export class JbTechTag extends LitElement {
	static styles = css`
		:host {
			display: inline-block;
			font-family: var(--jb-font-mono);
			font-size: 0.65rem;
			font-weight: 500;
			padding: 3px 8px;
			border-radius: var(--jb-radius-sm);
			background: var(--jb-accent-soft);
			color: var(--jb-accent);
		}
	`;

	render() {
		return html`<slot></slot>`;
	}
}
