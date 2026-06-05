// Cursor-following spotlight for non-interactive cards. The pointer sets a *target* position;
// a rAF loop eases the published --mx/--my toward it, so the reveal window trails the cursor
// with a soft lag instead of snapping. The cards keep the default cursor (no link affordance) —
// the trailing glow + the card's own morphing gradient just signal the surface is alive.
// Desktop + motion only; without it (no JS, touch, reduced motion) the CSS centres the window.
export function initCardSpotlight(root: HTMLElement): () => void {
	if (typeof window === 'undefined') return () => {};
	const fine = window.matchMedia('(pointer: fine)').matches;
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (!fine || reduce) return () => {};

	let active: HTMLElement | null = null;
	let targetX = 0;
	let targetY = 0;
	let curX = 0;
	let curY = 0;
	let raf = 0;

	const EASE = 0.12;

	const tick = () => {
		curX += (targetX - curX) * EASE;
		curY += (targetY - curY) * EASE;
		if (active) {
			active.style.setProperty('--mx', `${curX}px`);
			active.style.setProperty('--my', `${curY}px`);
		}
		raf =
			Math.abs(targetX - curX) > 0.5 || Math.abs(targetY - curY) > 0.5
				? requestAnimationFrame(tick)
				: 0;
	};

	const onMove = (e: PointerEvent) => {
		const card = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-spotlight]');
		if (!card) return;
		const rect = card.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		if (card !== active) {
			active = card;
			curX = x; // jump to the new card so the window doesn't fly across the gap
			curY = y;
		}
		targetX = x;
		targetY = y;
		if (!raf) raf = requestAnimationFrame(tick);
	};

	root.addEventListener('pointermove', onMove);
	return () => {
		root.removeEventListener('pointermove', onMove);
		if (raf) cancelAnimationFrame(raf);
	};
}
