// Timeline scroll choreography, called from each variant's timeline page lifecycle.
//   1. Reveal — an IntersectionObserver marks [data-reveal] elements as they enter view
//      (works everywhere; under reduced motion everything is shown at once).
//   2. Direction — a scroll listener publishes the current scroll direction to the root as a
//      single --dir multiplier (1 down, -1 up) plus a data-scroll-dir attribute. The CSS flips
//      every parked offset's sign off --dir, so rows assemble from the right/below on the way
//      down and mirror — from the left/above — on the way up; the stagger order mirrors too.
//   3. Smooth scroll — on desktop, Lenis smooths scrolling so the assemble/disassemble reads
//      fluidly. Off under reduced motion / touch / narrow.
// Lenis is dynamically imported, so this module is safe to import during server prerender.

interface LenisLike {
	raf(time: number): void;
	destroy(): void;
	on(event: 'scroll', cb: (e: { velocity: number }) => void): void;
}

let lenis: LenisLike | null = null;
let frame = 0;
let observer: IntersectionObserver | null = null;
let onScroll: (() => void) | null = null;
let releaseReveal: (() => void) | null = null;

export async function initTimelineMotion(root: HTMLElement): Promise<void> {
	if (typeof window === 'undefined') return;
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// Reveal: rows ASSEMBLE on entering view and DISASSEMBLE on leaving (the observer toggles
	// [data-in] both ways, so the choreography replays as you scroll back and forth). Under
	// reduced motion everything is simply shown.
	const targets = root.querySelectorAll<HTMLElement>('[data-reveal]');
	if (reduce || !('IntersectionObserver' in window)) {
		for (const el of targets) el.setAttribute('data-in', '');
	} else {
		observer = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) e.target.setAttribute('data-in', '');
					else e.target.removeAttribute('data-in');
				}
			},
			{ rootMargin: '-12% 0px -12% 0px' },
		);
		for (const el of targets) observer.observe(el);

		// Arrived via a framework switch: the disintegration reassemble is the page's own
		// entrance, so the rows already on screen should come in *with* it, at rest, rather
		// than assembling on top of it. Snap just those to their revealed state with their
		// transitions suppressed for one frame ([data-instant], cleared below); rows further
		// down are left untouched and assemble normally when scrolled into view. Keyed on the
		// persistent marker, not the reassemble's clock, so it holds regardless of when each
		// framework hydrates this list.
		if (document.documentElement.hasAttribute('data-switched')) {
			const viewportH = window.innerHeight;
			const onscreen: HTMLElement[] = [];
			for (const el of targets) {
				const rect = el.getBoundingClientRect();
				if (rect.top < viewportH && rect.bottom > 0) {
					el.setAttribute('data-instant', '');
					el.setAttribute('data-in', '');
					onscreen.push(el);
				}
			}
			if (onscreen.length > 0) {
				// Hold these rows at rest (transitions suppressed) for the WHOLE reassemble — it is
				// their entrance — then release so rows scrolled in afterwards animate normally. Tie
				// the release to the reassemble actually finishing (the `jb:reassembled` event), not a
				// fixed frame count, so it holds regardless of when this framework hydrated the list.
				// If the reassemble already finished before we mounted, release on the next frame.
				const release = () => {
					releaseReveal = null;
					requestAnimationFrame(() => {
						for (const el of onscreen) el.removeAttribute('data-instant');
					});
				};
				if (document.documentElement.hasAttribute('data-reassembled')) {
					release();
				} else {
					releaseReveal = release;
					document.addEventListener('jb:reassembled', release, { once: true });
				}
			}
		}
	}

	// Direction: publish the scroll direction so the reveal mirrors itself. One --dir
	// multiplier flips the sign of every parked offset; data-scroll-dir flips the stagger
	// order. Nothing to publish under reduced motion (no offsets animate).
	if (!reduce) {
		root.dataset.scrollDir = 'down';
		root.style.setProperty('--dir', '1');
		let lastY = window.scrollY;
		let ticking = false;
		const update = () => {
			ticking = false;
			const y = window.scrollY;
			const dy = y - lastY;
			if (Math.abs(dy) < 4) return; // ignore sub-pixel jitter / bounce
			lastY = y;
			const dir = dy > 0 ? 'down' : 'up';
			if (root.dataset.scrollDir === dir) return;
			root.dataset.scrollDir = dir;
			root.style.setProperty('--dir', dir === 'up' ? '-1' : '1');
		};
		onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(update);
		};
		window.addEventListener('scroll', onScroll, { passive: true });
	}

	// Desktop: Lenis smooths the scroll so the assemble/disassemble feels fluid.
	const desktop =
		window.matchMedia('(min-width: 981px)').matches &&
		window.matchMedia('(pointer: fine)').matches;
	if (reduce || !desktop) return;

	const { default: Lenis } = await import('lenis');
	lenis = new Lenis() as unknown as LenisLike;
	const loop = (time: number) => {
		lenis?.raf(time);
		frame = requestAnimationFrame(loop);
	};
	frame = requestAnimationFrame(loop);
}

export function destroyTimelineMotion(): void {
	observer?.disconnect();
	observer = null;
	if (onScroll) window.removeEventListener('scroll', onScroll);
	onScroll = null;
	if (releaseReveal) document.removeEventListener('jb:reassembled', releaseReveal);
	releaseReveal = null;
	if (frame) cancelAnimationFrame(frame);
	frame = 0;
	lenis?.destroy();
	lenis = null;
}
