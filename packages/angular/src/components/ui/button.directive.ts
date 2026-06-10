import { Directive, input } from '@angular/core';

// The shared action primitive, the idiomatic Angular way: an attribute directive on a real
// <a> or <button>, so routing (routerLink) and native button semantics stay on the host element
// instead of being wrapped away. The look is owned by the global `.btn` classes (styles/base.css);
// the directive only toggles them. Three orthogonal axes: variant repaints, size is geometry,
// tone is casing (sentence-case default; "marketing" is the loud uppercase CTA treatment).

export type ButtonVariant = 'primary' | 'inverted' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md';
export type ButtonTone = 'plain' | 'marketing';

@Directive({
	selector: 'a[jbButton], button[jbButton]',
	standalone: true,
	host: {
		class: 'btn',
		'[class.btn--inverted]': "variant() === 'inverted'",
		'[class.btn--secondary]': "variant() === 'secondary'",
		'[class.btn--ghost]': "variant() === 'ghost'",
		'[class.btn--sm]': "size() === 'sm'",
		'[class.btn--marketing]': "tone() === 'marketing'",
	},
})
export class ButtonDirective {
	readonly variant = input<ButtonVariant>('primary');
	readonly size = input<ButtonSize>('md');
	readonly tone = input<ButtonTone>('plain');
}
