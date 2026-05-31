import { createBrowserRouter } from 'react-router'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Services } from './pages/Services'
import { Work } from './pages/Work'
import { Blog } from './pages/Blog'
import { Contact } from './pages/Contact'

export const router = createBrowserRouter([
	{ path: '/', Component: Home },
	{ path: '/about', Component: About },
	{ path: '/services', Component: Services },
	{ path: '/work', Component: Work },
	{ path: '/blog', Component: Blog },
	{ path: '/contact', Component: Contact },
])
