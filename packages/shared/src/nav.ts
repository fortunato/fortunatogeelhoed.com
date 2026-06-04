/** A primary-navigation destination, rendered in both the top bar and the
 *  mobile bottom tab bar. Every path must resolve to a real, built page. */
export interface NavItem {
	label: string;
	path: string;
	/** Identifier for the bottom-tab glyph. */
	icon: string;
}

/** The primary navigation. Single source of truth across all three variants;
 *  only built destinations appear here. */
export const NAV_ITEMS: NavItem[] = [
	{ label: 'Home', path: '/', icon: 'home' },
	{ label: 'Timeline', path: '/timeline', icon: 'timeline' },
	{ label: 'Contact', path: '/contact', icon: 'contact' },
];
