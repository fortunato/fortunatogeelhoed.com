import { initSwitchTransition } from '@fg/shared';
import { registerElements } from '@fg/shared/elements';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';

// Register the shared web components before hydration. Safe here: this client entry
// never runs during prerender (that uses entry-server.tsx).
registerElements();

const container = document.getElementById('app') as HTMLElement;

if (container.hasChildNodes()) {
	hydrateRoot(container, <App />);
} else {
	createRoot(container).render(<App />);
}

initSwitchTransition();
