import contentData from '@fg/content-data/data.json';
import {
	type ContentItem,
	consumeSwitchScroll,
	initNavMotion,
	initPopstateMotion,
	initSwitchTransition,
} from '@fg/shared';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { ViteSSG } from 'vite-ssg';
import App from './App.vue';
import { setContent } from './composables/useContent';
import { routes } from './router';

export const createApp = ViteSSG(
	App,
	{
		routes,
		// Scroll is owned by the shared motion sequence, not by per-location restore. Click-driven
		// navigation smooth-scrolls to the top through the interceptor; back/forward does the same
		// through initPopstateMotion below. So we return false on a popstate (savedPosition present)
		// to leave that scroll to the shared tween, and don't restore a saved offset on push either.
		// The one offset we do want back is a framework-switch arrival (a fresh cross-document load,
		// where savedPosition is null) — consumeSwitchScroll returns non-null only once, after a switch.
		scrollBehavior(_to, _from, savedPosition) {
			if (savedPosition) return false;
			const switchY = consumeSwitchScroll();
			if (switchY !== null) return { top: switchY };
			return { top: 0 };
		},
	},
	({ app, router }) => {
		// staleTime mirrors the endpoint's max-age=60; window-focus refetch is a Query default.
		app.use(VueQueryPlugin, {
			queryClientConfig: { defaultOptions: { queries: { staleTime: 60_000 } } },
		});
		setContent(contentData as Record<string, ContentItem>);
		// Register the shared web components in the browser only. vite-ssg runs this hook
		// during prerender in a DOM-simulated context; a guarded dynamic import keeps the
		// Lit element classes (which `extends HTMLElement` at evaluation time) out of that
		// build entirely.
		if (!import.meta.env.SSR) {
			import('@fg/shared/elements').then((m) => m.registerElements());
			import('@fg/shared/rum').then((m) => m.startRum('vue'));

			// In-app navigation smooth-scrolls to the top, then plays the destination's entrance.
			// The shared interceptor owns the sequence (identical in React, Vue, Angular) and commits
			// the route via the router only after the scroll settles; the scrollBehavior above then
			// no-ops at the already-restored top. Back/forward still restores through scrollBehavior.
			initNavMotion((path) => {
					void router.push(path);
				});

			// Back/forward mirror the click sequence: smooth-scroll to the top, then replay the
			// entrance. Vue Router commits the popstate view synchronously, so the shared window
			// listener (which also forces scrollRestoration to 'manual') is enough; scrollBehavior
			// returns false on popstate so it doesn't fight the tween.
			initPopstateMotion();
		}
		initSwitchTransition();
	},
);
