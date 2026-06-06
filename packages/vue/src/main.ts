import { type ContentItem, initSwitchTransition } from '@fg/shared';
import { ViteSSG } from 'vite-ssg';
import { nextTick } from 'vue';
import contentData from '../../content/data.json';
import App from './App.vue';
import { setContent } from './composables/useContent';
import { routes } from './router';

export const createApp = ViteSSG(
	App,
	{
		routes,
		// Instant navigation (no View Transitions / reduced motion) and back/forward restore.
		// The animated path resets scroll inside the transition below so the slide masks it.
		scrollBehavior(_to, _from, savedPosition) {
			return savedPosition ?? { top: 0 };
		},
	},
	({ router }) => {
		setContent(contentData as Record<string, ContentItem>);
		// Register the shared web components in the browser only. vite-ssg runs this hook
		// during prerender in a DOM-simulated context; a guarded dynamic import keeps the
		// Lit element classes (which `extends HTMLElement` at evaluation time) out of that
		// build entirely.
		if (!import.meta.env.SSR) {
			import('@fg/shared/elements').then((m) => m.registerElements());

			// Same-document page transitions. The slide/cross-fade lives in styles/motion.css;
			// browsers without the View Transitions API (or with reduced motion) navigate instantly.
			router.beforeResolve((to, from) => {
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
