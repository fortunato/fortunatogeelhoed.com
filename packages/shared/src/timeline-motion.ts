// Timeline scroll choreography, called from each variant's timeline page lifecycle.
//   1. Reveal — an IntersectionObserver marks [data-reveal] elements as they enter view
//      (works everywhere; under reduced motion everything is shown at once).
//   2. Smooth scroll — on desktop, Lenis smooths scrolling so the assemble/disassemble reads
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
	if (frame) cancelAnimationFrame(frame);
	frame = 0;
	lenis?.destroy();
	lenis = null;
}
