import { Injectable } from '@angular/core'
import type { ContentItem } from '@fg/shared'

@Injectable({ providedIn: 'root' })
export class ContentService {
	private contentMap: Record<string, ContentItem> = {}

	setContent(map: Record<string, ContentItem>) {
		this.contentMap = map
	}

	getContent(slug: string): ContentItem | null {
		return this.contentMap[slug] ?? null
	}
}
