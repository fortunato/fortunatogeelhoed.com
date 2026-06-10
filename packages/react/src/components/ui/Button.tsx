import {
	type AnchorHTMLAttributes,
	type ButtonHTMLAttributes,
	type ReactNode,
	type Ref,
	forwardRef,
} from 'react';
import { Link, type LinkProps } from 'react-router';

// The shared action primitive. One polymorphic component resolves to the element the usage
// actually needs — a real <button>, an internal router <Link>, or an external <a> — while the
// look is owned entirely by the global `.btn` classes (see styles/base.css). Three orthogonal
// axes: variant repaints, size is geometry, tone is casing. The default tone is sentence-case
// (in-content); the loud uppercase treatment is opt-in via tone="marketing", reserved for
// headline calls to action (the closing CTA, the contact submit).

export type ButtonVariant = 'primary' | 'inverted' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md';
export type ButtonTone = 'plain' | 'marketing';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
	primary: '',
	inverted: 'btn--inverted',
	secondary: 'btn--secondary',
	ghost: 'btn--ghost',
};

/** Compose the global class string for a button. Exported so call sites that cannot use the
 *  component (rare) still stay on the design system. */
export function buttonClass(
	variant: ButtonVariant = 'primary',
	size: ButtonSize = 'md',
	tone: ButtonTone = 'plain',
	className?: string,
): string {
	return [
		'btn',
		VARIANT_CLASS[variant],
		size === 'sm' ? 'btn--sm' : '',
		tone === 'marketing' ? 'btn--marketing' : '',
		className,
	]
		.filter(Boolean)
		.join(' ');
}

type BaseProps = {
	variant?: ButtonVariant;
	size?: ButtonSize;
	/** Casing. Defaults to sentence-case; "marketing" is the loud uppercase CTA treatment. */
	tone?: ButtonTone;
	/** Optional leading glyph, rendered via the shared jb-icon element (e.g. "github"). */
	icon?: string;
	children: ReactNode;
	className?: string;
};

type AsButton = BaseProps &
	Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'ref'> & {
		to?: never;
		href?: never;
	};

type AsRoute = BaseProps &
	Omit<LinkProps, 'to' | 'className' | 'ref'> & { to: string; href?: never };

type AsAnchor = BaseProps &
	Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'ref'> & {
		href: string;
		to?: never;
	};

export type ButtonProps = AsButton | AsRoute | AsAnchor;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
	function Button(
		{ variant = 'primary', size = 'md', tone = 'plain', icon, children, className, ...rest },
		ref,
	) {
		const cls = buttonClass(variant, size, tone, className);
		const content = (
			<>
				{icon ? <jb-icon name={icon} /> : null}
				{children}
			</>
		);

		if ('to' in rest && rest.to != null) {
			const { to, ...linkRest } = rest as AsRoute;
			return (
				<Link ref={ref as Ref<HTMLAnchorElement>} to={to} className={cls} {...linkRest}>
					{content}
				</Link>
			);
		}

		if ('href' in rest && rest.href != null) {
			const { href, ...anchorRest } = rest as AsAnchor;
			return (
				<a ref={ref as Ref<HTMLAnchorElement>} href={href} className={cls} {...anchorRest}>
					{content}
				</a>
			);
		}

		return (
			<button ref={ref as Ref<HTMLButtonElement>} className={cls} {...(rest as AsButton)}>
				{content}
			</button>
		);
	},
);
