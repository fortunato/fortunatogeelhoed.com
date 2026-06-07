/** A technology lane on the career timeline (databases fold into backend). */
export type Lane = 'frontend' | 'backend' | 'cicd' | 'ai';

/** How an engagement was held. Drives the type label + node color. */
export type EmploymentType = 'employee' | 'independent' | 'side-project';

/** Visual intensity of framework exposure on the framework ribbon. */
export type ExposureIntensity = 'professional' | 'occasional' | 'brief';

/** A year, or the open-ended present. */
export type TimelineYear = number | 'present';

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

/** Header copy for the career timeline page (kicker, heading, intro paragraph). */
export interface TimelinePageCopy {
	label: string;
	title: string;
	intro: string;
}
