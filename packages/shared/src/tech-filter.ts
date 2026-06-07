// Pure helpers behind the timeline's tech-pill filters. Framework-agnostic: the three
// variants each hold their own reactive Set of active techs (React Context, a Vue module
// singleton, an Angular signal service) but share this logic for matching and for the
// URL/sessionStorage round-trip. Beyond the guarded sessionStorage glue at the bottom there
// is no DOM here, so the module is safe to import during Node/SSG prerender.
//
// Invariants worth knowing before editing:
//   - The canonical in-memory filter value is a Set of tech *display names* (e.g. "React"),
//     because that is exactly how pills, `entry.tech`, and TECH_REGISTRY are already keyed —
//     so there is no lookup on the hot path. Slugs exist only at the URL/storage boundary.
//   - `techSlug` must round-trip: TECH_SLUG_TO_NAME is built once from the registry keys so a
//     slug maps back to its display name. Two names that slugify to the same token collide;
//     the first registered wins and we warn (a content bug to fix, never a silent merge).
//   - Matching is AND: a row survives only if it carries *every* active tech. An empty set
//     matches everything (no filter, so nothing is dimmed).

import { TECH_REGISTRY } from './tech';
import { LANES, type TimelineEntry } from './types/timeline';

/** Slugify a tech display name into a URL/storage-safe token ("Next.js" -> "next-js"). */
export function techSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Reverse map slug -> display name, built once from the registry keys. First name wins on
 *  a slug collision (and warns), so the slug -> name direction stays unambiguous. */
export const TECH_SLUG_TO_NAME: Record<string, string> = Object.keys(TECH_REGISTRY).reduce<
	Record<string, string>
>((map, name) => {
	const slug = techSlug(name);
	const existing = map[slug];
	if (existing !== undefined) {
		console.warn(
			`[tech-filter] slug collision: "${name}" and "${existing}" both slugify to "${slug}"; keeping "${existing}".`,
		);
		return map;
	}
	map[slug] = name;
	return map;
}, {});

/** Resolve a URL/storage token back to a display name; unknown tokens return undefined so
 *  stale or hand-edited slugs are dropped rather than producing phantom filters. */
export function techNameFromSlug(slug: string): string | undefined {
	return TECH_SLUG_TO_NAME[slug];
}

/** AND match: does this entry carry every active tech? Empty set matches everything. */
export function entryMatchesTech(entry: TimelineEntry, activeNames: ReadonlySet<string>): boolean {
	if (activeNames.size === 0) return true;
	const techs = new Set<string>();
	for (const lane of LANES) {
		const names = entry.tech[lane];
		if (names) for (const name of names) techs.add(name);
	}
	for (const name of activeNames) {
		if (!techs.has(name)) return false;
	}
	return true;
}

/** Parse a comma-joined slug list (URL query or stored value) into a Set of display names,
 *  dropping unknown/blank tokens. */
export function parseTechQuery(raw: string | null | undefined): Set<string> {
	if (!raw) return new Set();
	const names = raw
		.split(',')
		.map((token) => techNameFromSlug(token.trim()))
		.filter((name): name is string => name !== undefined);
	return new Set(names);
}

/** Serialise active display names to a canonical comma-joined slug list (sorted for stable
 *  URLs); an empty set yields "" so callers can drop the query/storage key. */
export function formatTechQuery(activeNames: ReadonlySet<string>): string {
	return [...activeNames].map(techSlug).sort().join(',');
}

const STORAGE_KEY = 'jb:timeline:tech';

/** Read the persisted filter from sessionStorage (shared per-origin, so it survives a
 *  framework switch). Guarded so Node/SSG imports and storage-blocked browsers return empty. */
export function readTechFilter(): Set<string> {
	try {
		if (typeof sessionStorage === 'undefined') return new Set();
		return parseTechQuery(sessionStorage.getItem(STORAGE_KEY));
	} catch {
		return new Set();
	}
}

/** Mirror the active filter to sessionStorage; removes the key when empty. Swallows
 *  quota/private-mode errors so persistence degrades to URL-only rather than throwing. */
export function writeTechFilter(activeNames: ReadonlySet<string>): void {
	try {
		if (typeof sessionStorage === 'undefined') return;
		const value = formatTechQuery(activeNames);
		if (value) sessionStorage.setItem(STORAGE_KEY, value);
		else sessionStorage.removeItem(STORAGE_KEY);
	} catch {
		// private mode / quota / blocked — degrade to URL-only.
	}
}

/** Read the active filter from the current URL's `tech` query (client only). */
export function readTechFilterUrl(): Set<string> {
	if (typeof window === 'undefined') return new Set();
	return parseTechQuery(new URLSearchParams(window.location.search).get('tech'));
}

/** Reflect the active filter in the URL's `tech` query via History.replaceState. This is a
 *  history rewrite, NOT a navigation — toggling a filter must not scroll the page, re-run the
 *  router, or push a history entry. The query is there purely so a filtered view is shareable
 *  and reload-safe. */
export function writeTechFilterUrl(activeNames: ReadonlySet<string>): void {
	if (typeof window === 'undefined' || !window.history) return;
	const url = new URL(window.location.href);
	const value = formatTechQuery(activeNames);
	if (value) url.searchParams.set('tech', value);
	else url.searchParams.delete('tech');
	window.history.replaceState(window.history.state, '', url);
}
