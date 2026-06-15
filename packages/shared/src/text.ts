/** A machine-readable value for a timeline entry's `<time datetime>`. Entry year strings are for
 *  display (single years, en-dashed ranges, and "now"), so the attribute uses the first full year
 *  found, which is a valid datetime token. Returns undefined when no year is present so the caller
 *  can omit the attribute rather than emit an invalid one. */
export function timelineDatetime(years: string): string | undefined {
	return years.match(/\d{4}/)?.[0];
}
