export interface ContentMeta {
	title: string;
	slug: string;
	type: 'page' | 'post' | 'case-study' | 'service';
	date?: string;
	description?: string;
	draft?: boolean;
}

export interface ContentItem extends ContentMeta {
	body: string;
}

/** A blog article. Extends a post-type content item with the single authored
 *  topic tag and the fields derived at build time: the rendered HTML body, the
 *  estimated reading time, and the resolved social-preview image. */
export interface Article extends ContentItem {
	/** Single topic tag, e.g. "Career" or "Build". */
	tag: string;
	/** Rendered HTML of the markdown body (produced once at build time). */
	html: string;
	/** Estimated reading time in whole minutes. */
	readingMinutes: number;
	/** Absolute path to the social-preview image, or the site default. */
	ogImage: string;
}
