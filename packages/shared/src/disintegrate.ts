// GPU-driven "disintegration" for the framework switch: an SVG turbulence +
// displacement-map filter shreds the outgoing page into particles, and the
// incoming page reassembles from them (reverse displacement). Driven by
// requestAnimationFrame because feDisplacementMap's `scale` is an SVG attribute,
// not a CSS property, so it can't be animated with CSS/WAAPI.
//
// Coordination across the (cross-document) navigation: the shred sets a
// sessionStorage flag before navigating; the inline <head> script hides the next
// document before first paint (no flash of the assembled page); this module then
// reassembles it on load. Progressive enhancement: the switcher entries are plain
// links, so with JS off — or on Safari (whose feDisplacementMap is unreliable), or
// under reduced motion/data — the click just navigates and the CSS cross-fade
// baseline handles the transition.

const SVG_NS = 'http://www.w3.org/2000/svg';
const FLAG = 'jb-reassemble';
// Scroll offset saved on the outgoing page so the destination framework can restore it across
// the cross-document switch (React's router persists scroll itself; Vue/Angular read this).
const SCROLL_KEY = 'jb-switch-scroll';
const MAX_SCALE = 600;

// Announce that the incoming page's reassemble is done (or was skipped). Page-entrance
// choreography that would otherwise race the reassemble (e.g. the timeline row assemble) waits
// for this. A durable attribute covers listeners that mount *after* the event has already fired.
function signalReassembled(): void {
	document.documentElement.setAttribute('data-reassembled', '');
	document.dispatchEvent(new CustomEvent('jb:reassembled'));
}

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

// Reassemble the incoming page from particles, then remove the filter so the page
// is left clean and interactive.
function playReassemble(durationMs = 700): void {
	const [svg, disp] = injectFilter();
	const root = document.documentElement;
	root.style.filter = 'url(#jb-shred)';
	root.style.willChange = 'filter, opacity';
	disp?.setAttribute('scale', String(MAX_SCALE));
	root.style.opacity = '0';
	const start = performance.now();
	const step = (now: number) => {
		const t = Math.min(1, (now - start) / durationMs);
		const e = 1 - (1 - t) * (1 - t); // ease-out: rush together, then settle
		disp?.setAttribute('scale', String((1 - e) * MAX_SCALE));
		root.style.opacity = String(e);
		if (t < 1) {
			requestAnimationFrame(step);
		} else {
			root.style.filter = '';
			root.style.willChange = '';
			root.style.opacity = '';
			svg.remove();
			signalReassembled();
		}
	};
	requestAnimationFrame(step);
}

let wired = false;

/** Reassemble the incoming page (if we arrived via a switch) and intercept switch
    links to shred the outgoing page before navigating. */
export function initSwitchTransition(): void {
	if (typeof document === 'undefined' || wired) return;
	wired = true;

	// The inline <head> script has already hidden this document (opacity 0) if we
	// arrived via a switch, so there's no flash of the assembled page to undo.
	try {
		if (sessionStorage.getItem(FLAG)) {
			sessionStorage.removeItem(FLAG);
			if (shouldSkip()) {
				document.documentElement.style.opacity = '';
				signalReassembled();
			} else {
				playReassemble();
			}
		}
	} catch {
		document.documentElement.style.opacity = '';
	}

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
		try {
			sessionStorage.setItem(FLAG, '1');
		} catch {
			// sessionStorage unavailable — the incoming page just won't reassemble.
		}
		void playShred().then(() => {
			window.location.href = link.href;
		});
	});
}
