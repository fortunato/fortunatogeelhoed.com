// "Disintegration" for the framework switch: an SVG turbulence + displacement-map filter shreds
// the OUTGOING page into particles before the cross-document navigation. The INCOMING page's
// entrance is the browser's cross-document view transition (a gentle cross-fade — see
// styles/motion.css); there is deliberately no JS "reassemble". A rAF-driven filter animation on
// the incoming page froze against Angular's heavy synchronous bootstrap (the main thread is blocked
// during hydration, so requestAnimationFrame stalls then jumps) and raced the GPU filter apply,
// flashing the constructed page — a timing/compositing race we can't reliably win. The cross-fade
// is GPU-composited and immune to it.
//
// Driven by requestAnimationFrame because feDisplacementMap's `scale` is an SVG attribute, not a
// CSS property, so it can't be animated with CSS/WAAPI. Progressive enhancement: the switcher
// entries are plain links, so with JS off — or on Safari (whose feDisplacementMap is unreliable),
// or under reduced motion/data — the click just navigates and the CSS cross-fade handles it.

const SVG_NS = 'http://www.w3.org/2000/svg';
// Scroll offset saved on the outgoing page so the destination framework can restore it across the
// cross-document switch (React's router persists scroll itself; Vue/Angular read this).
const SCROLL_KEY = 'jb-switch-scroll';
const MAX_SCALE = 600;

/** Scroll offset saved by the last switch click, consumed once on the incoming page. Returns
    null when there's nothing to restore (no switch, or already consumed). */
export function consumeSwitchScroll(): number | null {
	try {
		const v = sessionStorage.getItem(SCROLL_KEY);
		if (v === null) return null;
		sessionStorage.removeItem(SCROLL_KEY);
		const n = Number(v);
		return Number.isFinite(n) ? n : null;
	} catch {
		return null;
	}
}

function shouldSkip(): boolean {
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
	if (matchMedia('(prefers-reduced-data: reduce)').matches) return true;
	// feDisplacementMap clips/misrenders in Safari — let it fall back to a plain nav.
	const ua = navigator.userAgent;
	return /safari/i.test(ua) && !/chrome|chromium|crios|android|fxios|edg/i.test(ua);
}

// Inject the shared turbulence + displacement filter. 2 octaves + a tight region +
// sRGB interpolation keep the per-frame cost down. Returns the <svg> and the
// feDisplacementMap node (whose `scale` we ramp).
function injectFilter(): [SVGSVGElement, Element | null] {
	const svg = document.createElementNS(SVG_NS, 'svg');
	svg.setAttribute('aria-hidden', 'true');
	svg.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none';
	svg.innerHTML =
		'<filter id="jb-shred" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">' +
		'<feTurbulence type="fractalNoise" baseFrequency="0.015 0.012" numOctaves="2" result="n"/>' +
		'<feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/>' +
		'</filter>';
	document.body.appendChild(svg);
	return [svg, svg.querySelector('feDisplacementMap')];
}

// Shred the page apart; resolves when done (the caller then navigates away, so no
// cleanup is needed — the document is discarded).
function playShred(durationMs = 700): Promise<void> {
	return new Promise((resolve) => {
		const [, disp] = injectFilter();
		const root = document.documentElement;
		root.style.filter = 'url(#jb-shred)';
		root.style.willChange = 'filter, opacity';
		const start = performance.now();
		const step = (now: number) => {
			const t = Math.min(1, (now - start) / durationMs);
			// Displacement ramps early (so the shred is visible); opacity holds high
			// and drops only late — the page is seen tearing apart before it's gone,
			// and the navigation (which waits for this to finish) lines up with that.
			disp?.setAttribute('scale', String(t ** 1.2 * MAX_SCALE));
			root.style.opacity = String(1 - t ** 4);
			if (t < 1) requestAnimationFrame(step);
			else resolve();
		};
		requestAnimationFrame(step);
	});
}

let wired = false;

/** Intercept switch links to shred the outgoing page (and save scroll) before navigating. The
    incoming page's entrance is the cross-document CSS cross-fade, so there's nothing to do on load. */
export function initSwitchTransition(): void {
	if (typeof document === 'undefined' || wired) return;
	wired = true;

	document.addEventListener('click', (e) => {
		if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
		const link = (e.target as Element | null)?.closest?.(
			'a[href^="/__switch"]',
		) as HTMLAnchorElement | null;
		if (!link) return;
		// Save scroll before leaving so the destination can restore it across the cross-document
		// load. Saved even on the fallback path below, so scroll survives there too.
		try {
			sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
		} catch {
			// sessionStorage unavailable — scroll just won't be restored.
		}
		if (shouldSkip()) return; // plain navigation + CSS cross-fade fallback
		e.preventDefault();
		void playShred().then(() => {
			window.location.href = link.href;
		});
	});
}
