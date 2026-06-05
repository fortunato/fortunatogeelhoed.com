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

/** The full homepage content consumed by the home page. */
export interface HomeContent {
	hero: {
		name: string;
		tagline: string;
		statement: string;
	};
	services: ServiceOffering[];
	proof: ProofPoint[];
	writing: WritingTeaserItem[];
	cta: {
		heading: string;
		href: string;
	};
}
