// JSX typings for the shared web components consumed in React.
// React 19 sets these props as DOM properties on custom elements and forwards the
// native `input`/`blur` events as `onInput`/`onBlur`.
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type CustomElement<Props = Record<never, never>> = DetailedHTMLProps<
	HTMLAttributes<HTMLElement>,
	HTMLElement
> &
	Props;

interface JbFieldProps {
	name?: string;
	value?: string;
	placeholder?: string;
	label?: string;
	required?: boolean;
	disabled?: boolean;
}

declare module 'react' {
	namespace JSX {
		interface IntrinsicElements {
			'jb-theme-toggle': CustomElement;
			'jb-tech-tag': CustomElement;
			'jb-input': CustomElement<JbFieldProps & { type?: string; autocomplete?: string }>;
			'jb-textarea': CustomElement<JbFieldProps & { rows?: number }>;
		}
	}
}
