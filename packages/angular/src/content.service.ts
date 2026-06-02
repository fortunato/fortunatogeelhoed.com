import { Injectable } from '@angular/core';
import type { ContentItem } from '@fg/shared';
import contentData from '../../content/data.json';

@Injectable({ providedIn: 'root' })
export class ContentService {
	private contentMap: Record<string, ContentItem> = contentData as Record<string, ContentItem>;

	getContent(slug: string): ContentItem | null {
		return this.contentMap[slug] ?? null;
	}
}
