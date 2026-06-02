import type { RouteObject } from 'react-router'
import { About } from './pages/About'
import { Blog } from './pages/Blog'
import { Contact } from './pages/Contact'
import { Home } from './pages/Home'
import { Services } from './pages/Services'
import { Work } from './pages/Work'

export const routes: RouteObject[] = [
	{ path: '/', Component: Home },
	{ path: '/about', Component: About },
	{ path: '/services', Component: Services },
	{ path: '/work', Component: Work },
	{ path: '/blog', Component: Blog },
	{ path: '/contact', Component: Contact },
]
