// In-app navigation motion: a real smooth scroll to the top, then the destination page's
// entrance animation — sequenced so the entrance only begins once the scroll has settled.
//
// This replaces the same-document page view-transition (which folded scroll-reset and the
// content swap into one slide). The cross-document framework switch keeps its own transition
// (see disintegrate.ts) and never routes through here.
//
// The sequencing lives entirely in shared code and is driven by intercepting in-app link
// clicks, so React, Vue, and Angular behave and time identically — each framework supplies
// only a tiny adapter that performs the actual route change. Everything is browser-only and
// guarded for server prerender, and the whole sequence collapses to an instant, fully-visible
// result under reduced motion or when the APIs are missing — content is never left hidden.

// Toggled on <main> while the destination page plays its entrance; the entrance keyframes in
// styles/motion.css key off this attribute so nothing animates until we ask it to.
const ENTER_ATTR = 'data-nav-enter';
// Tasteful, brisk scroll-to-top: long enough to read as motion, short enough that navigation
// never feels sluggish. Capped by a safety timeout below regardless.
const SCROLL_MS = 360;
// Below this we treat the page as already at the top and skip the tween entirely.
const TOP_EPSILON = 2;

function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

// easeInOutCubic — symmetric, no overshoot, matches the calm feel of the rest of the site.
function ease(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Smooth-scroll the window to the top, then resolve. Resolves immediately (instant jump) when
 * already at the top, under reduced motion, or outside the browser. Owns its own rAF tween so
 * the completion signal is reliable cross-browser (scrollend support is uneven); a safety
 * timeout guarantees resolution even if a frame is dropped or scrolling is interrupted.
 */
export function smoothScrollToTop(): Promise<void> {
	if (typeof window === 'undefined') return Promise.resolve();

	const start = window.scrollY;
	if (start <= TOP_EPSILON || prefersReducedMotion()) {
		window.scrollTo(0, 0);
		return Promise.resolve();
	}

	return new Promise<void>((resolve) => {
		let done = false;
		const finish = () => {
			if (done) return;
			done = true;
			window.scrollTo(0, 0);
			resolve();
		};
		// Safety net: never hang the entrance if a frame stalls or the user interrupts the scroll.
		const safety = window.setTimeout(finish, SCROLL_MS + 200);
		const t0 = performance.now();
		const step = (now: number) => {
			const t = Math.min(1, (now - t0) / SCROLL_MS);
			window.scrollTo(0, Math.round(start * (1 - ease(t))));
			if (t < 1 && !done) {
				requestAnimationFrame(step);
			} else {
				window.clearTimeout(safety);
				finish();
			}
		};
		requestAnimationFrame(step);
	});
}

// (Re)start the entrance animation. The attribute is baked into the prerendered <main> so the
// landing entrance plays from first paint with no flash; here we remove and re-add it so the
// keyframes replay on each subsequent navigation, including between two routes. Exported so the
// popstate hook (and Angular's router-event hook) can replay the same entrance the click path does.
export function replayEntrance(): void {
	const main = document.querySelector('main');
	if (!main) return;
	main.removeAttribute(ENTER_ATTR);
	// Force a reflow so the removal is committed before we re-add — without this the browser
	// coalesces the toggle and the animation never restarts.
	void main.offsetWidth;
	main.setAttribute(ENTER_ATTR, '');
}

/** A route change for the destination path; resolves once the new view is committed. */
type Navigate = (path: string) => void | Promise<void>;

function isPlainLeftClick(e: MouseEvent): boolean {
	return (
		!e.defaultPrevented &&
		e.button === 0 &&
		!e.metaKey &&
		!e.ctrlKey &&
		!e.shiftKey &&
		!e.altKey
	);
}

// In-app links only: same-origin, not the framework switcher, not a download / new tab / external,
// and not a pure in-page hash on the current path (let the browser handle anchor jumps).
function resolveInAppTarget(link: HTMLAnchorElement): string | null {
	if (link.target && link.target !== '_self') return null;
	if (link.hasAttribute('download')) return null;
	if (link.origin !== window.location.origin) return null;
	if (link.pathname.startsWith('/__switch')) return null;
	const samePath = link.pathname === window.location.pathname;
	// A hash on the same path is an in-page jump — leave it to the browser/router.
	if (samePath && link.hash) return null;
	if (samePath && link.search === window.location.search) return null;
	return link.pathname + link.search + link.hash;
}

let wired = false;

/**
 * Intercept in-app link navigation so it smooth-scrolls to the top, commits the route change,
 * then replays the destination's entrance — in that order. `navigate` is the framework's router
 * push; the listener handles the scroll/entrance sequencing identically for all three.
 *
 * The entrance attribute is always set after the commit (even if the commit rejects), so a page
 * can never be stranded with its content held at opacity:0.
 */
export function initNavMotion(navigate: Navigate): () => void {
	if (typeof document === 'undefined') return () => {};

	const onClick = (e: MouseEvent) => {
		if (!isPlainLeftClick(e)) return;
		const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
		if (!link) return;
		const target = resolveInAppTarget(link);
		if (target === null) return;

		// Take full ownership of this click: preventDefault stops the browser's own navigation, and
		// stopping propagation here (capture phase) keeps the framework's RouterLink handler from
		// firing a second, immediate navigation. We commit the route ourselves after the scroll.
		e.preventDefault();
		e.stopImmediatePropagation();
		void smoothScrollToTop()
			.then(() => navigate(target))
			.finally(replayEntrance);
	};

	// Capture phase so this runs before each framework's own link handler (React Router's Link,
	// Vue Router's RouterLink, Angular's RouterLink all bind in the bubble phase) — we preventDefault
	// and drive the navigation ourselves, so theirs never fires for an intercepted in-app link.
	if (!wired) {
		document.addEventListener('click', onClick, true);
		wired = true;
	}
	return () => {
		document.removeEventListener('click', onClick, true);
		wired = false;
	};
}

let popstateWired = false;

/**
 * Mirror the click sequence for genuine in-session back/forward: smooth-scroll to the top, then
 * replay the destination's entrance. The browser commits the history view itself (popstate can't be
 * prevented), so we run the scroll/entrance once the new view has had a frame to render.
 *
 * `scrollRestoration` is forced to 'manual' so the browser's own restore doesn't fight the tween
 * with a competing jump. We deliberately ignore same-document hash changes (in-page anchors) and
 * never run on first load — only popstate fires this. The framework-switch arrival is a fresh
 * cross-document load, not a popstate, so its saved-offset restore (consumeSwitchScroll) still wins.
 *
 * Frameworks whose router commits the view synchronously on popstate (React Router, Vue Router) wire
 * this directly. Angular's navigation is async, so it sequences the same `smoothScrollToTop()` +
 * `replayEntrance()` off its own post-navigation event instead of using this window listener.
 */
export function initPopstateMotion(): () => void {
	if (typeof window === 'undefined') return () => {};

	if ('scrollRestoration' in history) {
		history.scrollRestoration = 'manual';
	}

	const pathSearch = () => window.location.pathname + window.location.search;
	// The last path+search we saw a navigation land on. Kept current through both router pushes
	// (which call history.pushState/replaceState — patched below) and back/forward (popstate), so
	// we can tell a genuine route change from a pure in-page hash jump on the same path.
	let lastPathSearch = pathSearch();
	const remember = () => {
		lastPathSearch = pathSearch();
	};

	// Router pushes don't emit popstate, so without recording them lastPathSearch would go stale and
	// the next back/forward could be misread as a hash-only change. Patch push/replaceState to keep
	// it in sync; the patch is additive (it calls through) and removed on teardown.
	const origPush = history.pushState.bind(history);
	const origReplace = history.replaceState.bind(history);
	history.pushState = (...args: Parameters<History['pushState']>) => {
		origPush(...args);
		remember();
	};
	history.replaceState = (...args: Parameters<History['replaceState']>) => {
		origReplace(...args);
		remember();
	};

	const onPopstate = () => {
		const path = pathSearch();
		// Same path+search means only the hash moved — an in-page anchor jump; leave it to the browser.
		if (path === lastPathSearch && window.location.hash) {
			remember();
			return;
		}
		remember();
		// Defer to the next frame so the router has committed the new view before we replay its
		// entrance; the scroll tween then runs over the freshly rendered page.
		requestAnimationFrame(() => {
			void smoothScrollToTop().finally(replayEntrance);
		});
	};

	if (!popstateWired) {
		window.addEventListener('popstate', onPopstate);
		popstateWired = true;
	}
	return () => {
		window.removeEventListener('popstate', onPopstate);
		history.pushState = origPush;
		history.replaceState = origReplace;
		popstateWired = false;
	};
}
