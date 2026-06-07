/** A technology lane on the career timeline (databases fold into backend). */
export type Lane = 'frontend' | 'backend' | 'cicd' | 'ai';

/** How an engagement was held. Drives the type label + node color. */
export type EmploymentType = 'employee' | 'independent' | 'side-project';

/** Industry/sector a piece of work was in. Controlled vocabulary so the chips read as
 *  signal rather than noise — abstract sectors only, never end-client/brand names. */
export type Domain =
	| 'Government'
	| 'Telecom'
	| 'Healthcare'
	| 'Fintech & Trading'
	| 'Finance'
	| 'Insurance'
	| 'Real Estate'
	| 'Energy'
	| 'E-commerce'
	| 'Retail'
	| 'Hospitality'
	| 'Travel'
	| 'Automotive'
	| 'Dating'
	| 'Marketing & Brand'
	| 'Media'
	| 'Education'
	| 'Developer Tooling';

/** Visual intensity of framework exposure on the framework ribbon. */
export type ExposureIntensity = 'professional' | 'occasional' | 'brief';

/** A year, or the open-ended present. */
export type TimelineYear = number | 'present';

/** A labelled link on a timeline entry — a write-up, source repo, live demo, etc.
 *  An absolute http(s) `href` opens in a new tab; anything else is an internal route. */
export interface TimelineLink {
	label: string;
	href: string;
	/** Optional leading glyph — a `jb-icon` name (e.g. `github`). */
	icon?: string;
	/** Optional fuller description for the `title`/`aria-label` (the visible label is terse). */
	title?: string;
}

/** A single role, engagement, or side project on the career timeline. */
export interface TimelineEntry {
	/** Stable slug, unique across the timeline. */
	id: string;
	/** Era / time-block this entry belongs to (e.g. "2020s — Netherlands"). */
	era: string;
	/** Display year range (e.g. "2020–25", "2026"). */
	years: string;
	startYear: number;
	endYear: TimelineYear;
	/** Employer, client, or project name. */
	client: string;
	/** Real role title (e.g. "Lead Full-Stack Engineer"). */
	role: string;
	type: EmploymentType;
	/** Industry/sector tags. In-house rows usually carry one; agency rows may span several. */
	domains?: Domain[];
	/** True when the role was held *at* an agency/consultancy serving end-clients. Orthogonal
	 *  to `type` (you can be an employee or independent at an agency); shown as a second badge. */
	agency?: boolean;
	/** Optional labelled links (write-up, source repo, live demo…). */
	links?: TimelineLink[];
	/** Optional highlight(s) — one line, or several. */
	highlight?: string | string[];
	/** Technologies grouped by lane; any lane may be absent. Names key into TECH_REGISTRY. */
	tech: Partial<Record<Lane, string[]>>;
}

/** A span of exposure to a single framework, for the framework ribbon. */
export interface FrameworkExposureSpan {
	framework: string;
	startYear: number;
	endYear: TimelineYear;
	intensity: ExposureIntensity;
}

/** The career timeline dataset consumed by the timeline page. The framework-exposure spans
 *  that feed the homepage ribbons are separate datasets (see @fg/content). */
export interface TimelineData {
	entries: TimelineEntry[];
}

export const LANES: Lane[] = ['frontend', 'backend', 'cicd', 'ai'];

/** Every known domain, for validation and any legend. Keep in sync with the `Domain` union. */
export const DOMAINS: Domain[] = [
	'Government',
	'Telecom',
	'Healthcare',
	'Fintech & Trading',
	'Finance',
	'Insurance',
	'Real Estate',
	'Energy',
	'E-commerce',
	'Retail',
	'Hospitality',
	'Travel',
	'Automotive',
	'Dating',
	'Marketing & Brand',
	'Media',
	'Education',
	'Developer Tooling',
];

/** Header copy for the career timeline page (kicker, heading, intro paragraph). */
export interface TimelinePageCopy {
	label: string;
	title: string;
	intro: string;
}
