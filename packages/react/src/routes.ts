import type { RouteObject } from 'react-router';
import { Layout } from './components/Layout';
import { About } from './pages/About';
import { Article } from './pages/Article';
import { Contact } from './pages/Contact';
import { Home } from './pages/Home';
import { Privacy } from './pages/Privacy';
import { Services } from './pages/Services';
import { Timeline } from './pages/Timeline';
import { Work } from './pages/Work';
import { Writing } from './pages/Writing';

export const routes: RouteObject[] = [
	{
		Component: Layout,
		children: [
			{ path: '/', Component: Home },
			{ path: '/about', Component: About },
			{ path: '/services', Component: Services },
			{ path: '/work', Component: Work },
			{ path: '/writing', Component: Writing },
			{ path: '/writing/:slug', Component: Article },
			{ path: '/career', Component: Timeline },
			{ path: '/contact', Component: Contact },
			{ path: '/privacy', Component: Privacy },
		],
	},
];
