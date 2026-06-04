/** A technology lane on the career timeline. */
export type Lane = 'frontend' | 'backend' | 'ci-cd' | 'ai-llm' | 'database';

/** How an engagement was held. Drives the year-node colour tint. */
export type EmploymentType = 'employee' | 'contractor' | 'freelance' | 'self-employed';

/** Visual intensity of framework exposure on the framework ribbon. */
export type ExposureIntensity = 'professional' | 'occasional' | 'brief';

/** A year, or the open-ended present. */
export type TimelineYear = number | 'present';

/** A single role or engagement on the career timeline. */
export interface TimelineEntry {
	/** Stable slug, unique across the timeline (e.g. "amsterdam"). */
	id: string;
	startYear: number;
	endYear: TimelineYear;
	organization: string;
	role: string;
	employmentType: EmploymentType;
	/** Technologies grouped by lane; any lane may be absent. */
	tech: Partial<Record<Lane, string[]>>;
	/** When true, renders in the parallel side-projects track. */
	isSideProject?: boolean;
	/** One-line description used in the narrow/mobile layout. */
	summary?: string;
}

/** A span of exposure to a single framework, for the framework ribbon. */
export interface FrameworkExposureSpan {
	framework: string;
	startYear: number;
	endYear: TimelineYear;
	intensity: ExposureIntensity;
}

/** The full timeline dataset consumed by the timeline page. */
export interface TimelineData {
	entries: TimelineEntry[];
	frameworks: FrameworkExposureSpan[];
}

export const LANES: Lane[] = ['ai-llm', 'ci-cd', 'backend', 'database', 'frontend'];
