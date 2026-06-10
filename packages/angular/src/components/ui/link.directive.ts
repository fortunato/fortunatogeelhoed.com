import { Directive, input } from '@angular/core';

// Text-first link. An attribute directive on an <a>. `inline` for prose; `arrow` adds the
// CSS-drawn chevron that nudges on hover. Look lives in `.link*` (styles/base.css).

export type LinkVariant = 'inline' | 'arrow';

@Directive({
	selector: 'a[jbLink]',
	standalone: true,
	host: {
		class: 'link',
		'[class.link--arrow]': "variant() === 'arrow'",
	},
})
export class LinkDirective {
	readonly variant = input<LinkVariant>('inline');
}
