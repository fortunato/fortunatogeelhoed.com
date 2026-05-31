import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'

const container = document.getElementById('app') as HTMLElement

if (container.hasChildNodes()) {
	hydrateRoot(container, <App />)
} else {
	createRoot(container).render(<App />)
}
