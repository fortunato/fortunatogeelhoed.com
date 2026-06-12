// Article URL helpers. Kept here, free of any content import, so the shared package stays a pure
// contract layer: callers that hold the published article list (the API, the prerenderers) pass it
// in, and these helpers turn it into the canonical /writing paths the rest of the site relies on.

/** Base path for the writing section. */
export const WRITING_BASE = '/writing';

/** The canonical path for a single article. */
export function articlePath(slug: string): string {
	return `${WRITING_BASE}/${slug}`;
}

/** Map a list of published articles (anything with a `slug`) to their canonical paths. */
export function articlePathsFromPosts(published: ReadonlyArray<{ slug: string }>): string[] {
	return published.map((p) => articlePath(p.slug));
}
