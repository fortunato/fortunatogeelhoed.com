import type { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent),
	},
	{
		path: 'about',
		loadComponent: () => import('./pages/about.component').then((m) => m.AboutComponent),
	},
	{
		path: 'services',
		loadComponent: () => import('./pages/services.component').then((m) => m.ServicesComponent),
	},
	{
		path: 'work',
		loadComponent: () => import('./pages/work.component').then((m) => m.WorkComponent),
	},
	{
		path: 'blog',
		loadComponent: () => import('./pages/blog.component').then((m) => m.BlogComponent),
	},
	{
		path: 'contact',
		loadComponent: () => import('./pages/contact.component').then((m) => m.ContactComponent),
	},
];
