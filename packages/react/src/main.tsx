import contentData from '@fg/content-data/data.json';
import type { ContentItem } from '@fg/shared';
import { initSwitchTransition } from '@fg/shared';
import { registerElements } from '@fg/shared/elements';
import { startRum } from '@fg/shared/rum';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';

// The page content map (same source the prerender feeds to the server). Without this the
// client would hydrate with an empty map and every content-driven page would fall back.
const content = contentData as Record<string, ContentItem>;

// Register the shared web components before hydration. Safe here: this client entry
// never runs during prerender (that uses entry-server.tsx).
registerElements();

const container = document.getElementById('app') as HTMLElement;

if (container.hasChildNodes()) {
	hydrateRoot(container, <App content={content} />);
} else {
	createRoot(container).render(<App content={content} />);
}

initSwitchTransition();
startRum('react');
