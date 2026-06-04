// Desktop-only inertial (smooth) scrolling for long pages — the career timeline.
// Scoped deliberately: off under reduced motion and on narrow / touch viewports, where
// native scrolling is better. Lenis is loaded via dynamic import so this module stays
// safe to import during server prerender (the import only runs in the browser).
//
// Called from each variant's timeline-page lifecycle (mount → init, unmount → destroy).

interface LenisLike {
	raf(time: number): void;
	destroy(): void;
}

let instance: LenisLike | null = null;
let frame = 0;

export async function initSmoothScroll(): Promise<void> {
	if (typeof window === 'undefined' || instance) return;
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const narrow = window.matchMedia('(max-width: 980px)').matches;
	const coarse = window.matchMedia('(pointer: coarse)').matches;
	if (reduce || narrow || coarse) return;

	const { default: Lenis } = await import('lenis');
	instance = new Lenis();

	const loop = (time: number) => {
		instance?.raf(time);
		frame = requestAnimationFrame(loop);
	};
	frame = requestAnimationFrame(loop);
}

export function destroySmoothScroll(): void {
	if (frame) cancelAnimationFrame(frame);
	frame = 0;
	instance?.destroy();
	instance = null;
}
