/** True for absolute http(s) URLs. External links open in a new tab; everything else is
 *  treated as an internal route and handed to the framework router. */
export function isExternalHref(href: string): boolean {
	return /^https?:\/\//i.test(href);
}
