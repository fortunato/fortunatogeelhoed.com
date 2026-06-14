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
		path: 'writing',
		loadComponent: () => import('./pages/writing.component').then((m) => m.WritingComponent),
	},
	{
		path: 'writing/:slug',
		loadComponent: () => import('./pages/article.component').then((m) => m.ArticleComponent),
	},
	{
		path: 'career',
		loadComponent: () => import('./pages/timeline.component').then((m) => m.TimelineComponent),
	},
	{
		path: 'contact',
		loadComponent: () => import('./pages/contact.component').then((m) => m.ContactComponent),
	},
	{
		path: 'privacy',
		loadComponent: () => import('./pages/privacy.component').then((m) => m.PrivacyComponent),
	},
];
