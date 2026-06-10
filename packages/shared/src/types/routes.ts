export interface RouteDefinition {
	path: string;
	name: string;
	contentSlug?: string;
	contentType?: string;
}

export const routes: RouteDefinition[] = [
	{ path: '/', name: 'Home', contentSlug: 'home', contentType: 'page' },
	{ path: '/about', name: 'About', contentSlug: 'about', contentType: 'page' },
	{ path: '/services', name: 'Services', contentSlug: 'services', contentType: 'page' },
	{ path: '/work', name: 'Work', contentSlug: 'work', contentType: 'page' },
	{ path: '/blog', name: 'Blog', contentSlug: 'blog', contentType: 'page' },
	{ path: '/contact', name: 'Contact', contentSlug: 'contact', contentType: 'page' },
	{ path: '/career', name: 'Timeline' },
];
