/** A homepage services-section card. */
export interface ServiceOffering {
	title: string;
	description: string;
}

/** A homepage proof-strip item — a real, factual achievement. */
export interface ProofPoint {
	metric: string;
	label: string;
}

/** A homepage recent-writing teaser entry. `href` resolves to a real route. */
export interface WritingTeaserItem {
	/** Short topical kicker shown above the title (e.g. "AI", "Career"). */
	tag: string;
	title: string;
	blurb: string;
	href: string;
}

/** Static copy for each homepage section header (the small kicker + heading).
 *  Kept with the content rather than inline in components so all three framework
 *  variants render the same words from one source. */
export interface HomeSectionsCopy {
	services: { label: string; title: string };
	proof: { label: string };
	frameworks: { label: string; title: string; intro: string };
	writing: { label: string; title: string; readMore: string };
}

/** The full homepage content consumed by the home page. */
export interface HomeContent {
	hero: {
		name: string;
		tagline: string;
		statement: string;
	};
	sections: HomeSectionsCopy;
	services: ServiceOffering[];
	proof: ProofPoint[];
	writing: WritingTeaserItem[];
	cta: {
		heading: string;
		href: string;
		/** Button text. */
		label: string;
	};
}
