import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';

// One renderer instance, reused for every article. `html: false` escapes any raw HTML in the
// source, so the output is safe to inject through each framework's trusted-HTML seam. `typographer`
// is deliberately OFF: it would rewrite "--" and "..." into typographic dashes/ellipses, and the
// house style is that published copy is exactly what was written (notably, no em dashes).
const md = new MarkdownIt({
	html: false,
	linkify: true,
	typographer: false,
}).use(anchor, {
	// Stable, readable ids on headings so deep links and a future table of contents work.
	slugify: (s: string) =>
		s
			.trim()
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-'),
});

// Open external links (absolute http/https URLs) in a new tab, with rel=noopener noreferrer for
// safety. Internal links (site-relative paths and in-page anchors) keep default same-tab behavior.
md.renderer.rules.link_open = (tokens, idx, options, _env, self) => {
	const token = tokens[idx];
	if (token && /^https?:\/\//i.test(token.attrGet('href') ?? '')) {
		token.attrSet('target', '_blank');
		token.attrSet('rel', 'noopener noreferrer');
	}
	return self.renderToken(tokens, idx, options);
};

/** Render an article's markdown body to HTML and estimate its reading time.
 *  Pure and deterministic: the same markdown always yields the same HTML, which is what keeps the
 *  three framework renders byte-identical. */
export function renderMarkdown(markdown: string): { html: string; readingMinutes: number } {
	const html = md.render(markdown);
	const words = markdown.trim().split(/\s+/).filter(Boolean).length;
	const readingMinutes = Math.max(1, Math.ceil(words / 220));
	return { html, readingMinutes };
}
