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
	{ label: 'About', path: '/about', icon: 'about' },
	{ label: 'Career', path: '/career', icon: 'timeline' },
	{ label: 'Writing', path: '/writing', icon: 'writing' },
	{ label: 'Contact', path: '/contact', icon: 'contact' },
];
