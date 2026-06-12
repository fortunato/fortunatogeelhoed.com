export const routes = [
	{ path: '/', name: 'Home', component: () => import('./pages/Home.vue') },
	{ path: '/about', name: 'About', component: () => import('./pages/About.vue') },
	{ path: '/services', name: 'Services', component: () => import('./pages/Services.vue') },
	{ path: '/work', name: 'Work', component: () => import('./pages/Work.vue') },
	{ path: '/writing', name: 'Writing', component: () => import('./pages/Writing.vue') },
	{ path: '/writing/:slug', name: 'Article', component: () => import('./pages/Article.vue') },
	{ path: '/career', name: 'Timeline', component: () => import('./pages/Timeline.vue') },
	{ path: '/contact', name: 'Contact', component: () => import('./pages/Contact.vue') },
];
