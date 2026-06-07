import { readTechFilter, readTechFilterUrl, writeTechFilter, writeTechFilterUrl } from '@fg/shared';
import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';

// Active tech-pill filters for the timeline, idiomatic React: a reducer over a Set of tech
// display names, shared through Context so deeply-nested pill buttons read/toggle it without
// prop-drilling. Hosted at the layout level (above the route outlet) so the selection survives
// in-app navigation; the URL + sessionStorage mirroring lives in useSyncTechFilterWithUrl,
// called from the timeline page so it only binds the URL while that page is mounted.

type Action =
	| { kind: 'toggle'; name: string }
	| { kind: 'clear' }
	| { kind: 'set'; names: Iterable<string> };

const EMPTY: ReadonlySet<string> = new Set();

function reducer(state: Set<string>, action: Action): Set<string> {
	switch (action.kind) {
		case 'toggle': {
			const next = new Set(state);
			if (!next.delete(action.name)) next.add(action.name);
			return next;
		}
		case 'clear':
			return state.size === 0 ? state : new Set();
		case 'set': {
			const next = new Set(action.names);
			if (next.size === state.size && [...next].every((n) => state.has(n))) return state;
			return next;
		}
	}
}

interface TechFilterValue {
	active: ReadonlySet<string>;
	isActive: (name: string) => boolean;
	toggle: (name: string) => void;
	clear: () => void;
	setActive: (names: Iterable<string>) => void;
}

const TechFilterContext = createContext<TechFilterValue | null>(null);

export function TechFilterProvider({ children }: { children: React.ReactNode }) {
	const [active, dispatch] = useReducer(reducer, EMPTY as Set<string>);

	const value = useMemo<TechFilterValue>(
		() => ({
			active,
			isActive: (name) => active.has(name),
			toggle: (name) => dispatch({ kind: 'toggle', name }),
			clear: () => dispatch({ kind: 'clear' }),
			setActive: (names) => dispatch({ kind: 'set', names }),
		}),
		[active],
	);

	return <TechFilterContext value={value}>{children}</TechFilterContext>;
}

export function useTechFilter(): TechFilterValue {
	const ctx = useContext(TechFilterContext);
	if (!ctx) throw new Error('useTechFilter must be used within a TechFilterProvider');
	return ctx;
}

/** Bind the filter to the URL query and sessionStorage. Call once from the timeline page.
 *  Seeds after mount (so the first client render matches the unfiltered prerender): the URL
 *  query wins when present, else the persisted value. Then mirrors every change to the URL via
 *  History.replaceState (a rewrite, not a navigation — no scroll, no router) and to
 *  sessionStorage. */
export function useSyncTechFilterWithUrl(): void {
	const { active, setActive } = useTechFilter();
	const firstWrite = useRef(true);

	// biome-ignore lint/correctness/useExhaustiveDependencies: seed exactly once, after mount.
	useEffect(() => {
		const fromUrl = readTechFilterUrl();
		if (fromUrl.size) setActive(fromUrl);
		else {
			const stored = readTechFilter();
			if (stored.size) setActive(stored);
		}
	}, []);

	useEffect(() => {
		// Skip the mount run so the seed above is not clobbered before it applies.
		if (firstWrite.current) {
			firstWrite.current = false;
			return;
		}
		writeTechFilterUrl(active);
		writeTechFilter(active);
	}, [active]);
}
