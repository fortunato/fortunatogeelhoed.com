/** Split a content body into trimmed paragraphs on blank lines, dropping empties.
 *  Lets page components render multi-paragraph prose without a Markdown engine. */
export function toParagraphs(body: string): string[] {
	return body
		.split(/\n{2,}/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);
}
