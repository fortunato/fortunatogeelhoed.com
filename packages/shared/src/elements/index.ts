// Registration entry for the shared web components.
//
// IMPORTANT: this module is deliberately NOT re-exported from `@fg/shared` (the barrel).
// The barrel is imported at build time in Node by the React/Angular prerender scripts and
// the content build, where `HTMLElement` does not exist — importing the Lit element classes
// there (they `extends HTMLElement` at class-evaluation time) would crash the build. Apps
// import this entry only from their browser-only client bootstrap (`@fg/shared/elements`).
//
// Registration is an explicit `registerElements()` call rather than a top-level side effect:
// a bare side-effecting import gets tree-shaken out by some bundlers (Angular's build dropped
// it entirely), whereas an invoked function is always retained.
import { JbInput } from './jb-input';
import { JbTechTag } from './jb-tech-tag';
import { JbTextarea } from './jb-textarea';
import { JbThemeToggle } from './jb-theme-toggle';

function define(tag: string, ctor: CustomElementConstructor): void {
	if (typeof customElements === 'undefined') return;
	if (!customElements.get(tag)) customElements.define(tag, ctor);
}

export function registerElements(): void {
	define('jb-input', JbInput);
	define('jb-textarea', JbTextarea);
	define('jb-theme-toggle', JbThemeToggle);
	define('jb-tech-tag', JbTechTag);
}

export { JbInput, JbTextarea, JbThemeToggle, JbTechTag };
