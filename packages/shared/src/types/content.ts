export interface ContentMeta {
	title: string
	slug: string
	type: 'page' | 'post' | 'case-study' | 'service'
	date?: string
	description?: string
	draft?: boolean
}

export interface ContentItem extends ContentMeta {
	body: string
}
