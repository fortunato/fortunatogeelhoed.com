import type { ContentItem } from '@fg/shared';
import { ref } from 'vue';

const contentCache = ref<Record<string, ContentItem>>({});

export function setContent(map: Record<string, ContentItem>) {
	contentCache.value = map;
}

export function useContent(slug: string) {
	return {
		content: contentCache.value[slug] ?? null,
	};
}
