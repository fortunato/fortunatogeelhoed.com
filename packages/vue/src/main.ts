import contentData from '@fg/content-data/data.json';
import { type ContentItem, consumeSwitchScroll, initSwitchTransition } from '@fg/shared';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { ViteSSG } from 'vite-ssg';
import { nextTick } from 'vue';
import { START_LOCATION } from 'vue-router';
import App from './App.vue';
import { setContent } from './composables/useContent';
import { routes } from './router';

export const createApp = ViteSSG(
	App,
	{
		routes,
		// Instant navigation (no View Transitions / reduced motion) and back/forward restore.
		// The animated path resets scroll inside the transition below so the slide masks it.
		// Arriving via a framework switch, restore the offset saved on the outgoing page (the
		// cross-document load would otherwise land at the top — React's router restores scroll, so
		// this keeps Vue consistent). consumeSwitchScroll returns non-null only once, after a switch.
		scrollBehavior(_to, _from, savedPosition) {
			if (savedPosition) return savedPosition;
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

			// Same-document page transitions. The slide/cross-fade lives in styles/motion.css;
			// browsers without the View Transitions API (or with reduced motion) navigate instantly.
			router.beforeResolve((to, from) => {
				// Skip on the initial load (incl. a switch arrival): there's no outgoing page to
				// slide, and its scrollTo(0,0) would clobber the restored switch scroll.
				if (from === START_LOCATION) return;
				if (to.path === from.path) return;
				if (!document.startViewTransition) return;
				if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
				return new Promise<void>((proceed) => {
					document.startViewTransition(async () => {
						proceed();
						await nextTick(); // new page committed, old Timeline unmounted (Lenis gone)
						window.scrollTo(0, 0); // captured in the new snapshot, before it is taken
					});
				});
			});
		}
		initSwitchTransition();
	},
);
