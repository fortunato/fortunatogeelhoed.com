import { type AnchorHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { type LinkProps, Link as RouterLink } from 'react-router';

// Text-first link. `inline` is the plain accent link; `arrow` adds the CSS-drawn chevron that
// nudges on hover (the "read more" / "see the timeline" affordance). Look lives in `.link*`
// (styles/base.css). Renders an internal router link or an external anchor.

export type LinkVariant = 'inline' | 'arrow';

type BaseProps = {
	variant?: LinkVariant;
	children: ReactNode;
	className?: string;
};

type AsRoute = BaseProps &
	Omit<LinkProps, 'to' | 'className' | 'ref'> & { to: string; href?: never };

type AsAnchor = BaseProps &
	Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'ref'> & {
		href: string;
		to?: never;
	};

export type TextLinkProps = AsRoute | AsAnchor;

function linkClass(variant: LinkVariant, className?: string): string {
	return ['link', variant === 'arrow' ? 'link--arrow' : '', className].filter(Boolean).join(' ');
}

export const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(function TextLink(
	{ variant = 'inline', children, className, ...rest },
	ref,
) {
	const cls = linkClass(variant, className);

	if ('to' in rest && rest.to != null) {
		const { to, ...linkRest } = rest as AsRoute;
		return (
			<RouterLink ref={ref} to={to} className={cls} {...linkRest}>
				{children}
			</RouterLink>
		);
	}

	const { href, ...anchorRest } = rest as AsAnchor;
	return (
		<a ref={ref} href={href} className={cls} {...anchorRest}>
			{children}
		</a>
	);
});
