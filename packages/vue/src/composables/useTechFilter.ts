import { readTechFilter, readTechFilterUrl, writeTechFilter, writeTechFilterUrl } from '@fg/shared';
import { onMounted, ref, watch } from 'vue';

// Active tech-pill filters for the timeline, idiomatic Vue: a module-level ref Set, cached for
// the app's lifetime (ES-module singleton) so the selection survives navigating away and back
// without a provider. The Set is replaced on every write — mutating it in place would not be
// reactive. The URL + sessionStorage mirroring lives in useTechFilterSync, called from the
// timeline page so the URL is only bound while that page is mounted.

const active = ref<Set<string>>(new Set());

export function useTechFilter() {
	return {
		active,
		isActive: (name: string) => active.value.has(name),
		toggle(name: string) {
			const next = new Set(active.value);
			if (!next.delete(name)) next.add(name);
			active.value = next;
		},
		clear() {
			if (active.value.size) active.value = new Set();
		},
		setActive(names: Iterable<string>) {
			active.value = new Set(names);
		},
	};
}

/** Bind the filter to the URL query and sessionStorage. Call once from the timeline page. Seeds
 *  after mount (so the first client render matches the unfiltered prerender): the URL query wins
 *  when present, else the persisted value. The lazy watcher then mirrors every change to the URL
 *  via History.replaceState (a rewrite, not a navigation — no scroll, no router) and to
 *  sessionStorage. */
export function useTechFilterSync(): void {
	onMounted(() => {
		const fromUrl = readTechFilterUrl();
		if (fromUrl.size) active.value = fromUrl;
		else {
			const stored = readTechFilter();
			if (stored.size) active.value = stored;
		}
	});

	watch(active, (a) => {
		writeTechFilterUrl(a);
		writeTechFilter(a);
	});
}
