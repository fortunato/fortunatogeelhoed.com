import { Injectable } from '@angular/core';
import contentData from '@fg/content-data/data.json';
import type { ContentItem } from '@fg/shared';

@Injectable({ providedIn: 'root' })
export class ContentService {
	private contentMap: Record<string, ContentItem> = contentData as Record<string, ContentItem>;

	getContent(slug: string): ContentItem | null {
		return this.contentMap[slug] ?? null;
	}
}
