import type { ExposureIntensity, TimelineData, TimelineYear } from './types/timeline';

// Pure layout maths for the timeline, shared by all three variants so the framework
// ribbon and axis are positioned identically everywhere (no per-framework drift). No DOM.

function toNumber(year: TimelineYear, present: number): number {
	return year === 'present' ? present : year;
}

/** Earliest and latest year across every entry and framework span. */
export function timelineBounds(data: TimelineData): { min: number; max: number } {
	const years: number[] = [];
	for (const entry of data.entries) {
		years.push(entry.startYear);
		if (entry.endYear !== 'present') years.push(entry.endYear);
	}
	for (const span of data.frameworks) {
		years.push(span.startYear);
		if (span.endYear !== 'present') years.push(span.endYear);
	}
	return { min: Math.min(...years), max: Math.max(...years) };
}

export interface RibbonSegment {
	intensity: ExposureIntensity;
	/** Percent offset from the left edge of the track. */
	left: number;
	/** Percent width of the track (a `brief` dot ignores this and renders fixed-size). */
	width: number;
}

export interface RibbonRow {
	framework: string;
	segments: RibbonSegment[];
}

/** One row per framework (in first-seen order), each span positioned along the shared axis. */
export function ribbonRows(data: TimelineData): RibbonRow[] {
	const { min, max } = timelineBounds(data);
	const span = max - min || 1;
	const byFramework = new Map<string, RibbonSegment[]>();

	for (const exposure of data.frameworks) {
		const end = toNumber(exposure.endYear, max);
		const left = ((exposure.startYear - min) / span) * 100;
		const width = ((end - exposure.startYear) / span) * 100;
		const segment: RibbonSegment = { intensity: exposure.intensity, left, width };
		const existing = byFramework.get(exposure.framework);
		if (existing) existing.push(segment);
		else byFramework.set(exposure.framework, [segment]);
	}

	return [...byFramework.entries()].map(([framework, segments]) => ({ framework, segments }));
}

export interface AxisTick {
	year: number;
	/** Percent offset from the left edge. */
	left: number;
}

/** Evenly spaced year markers (default every 5 years) across the shared axis. */
export function axisTicks(data: TimelineData, step = 5): AxisTick[] {
	const { min, max } = timelineBounds(data);
	const span = max - min || 1;
	const start = Math.ceil(min / step) * step;
	const ticks: AxisTick[] = [];
	for (let year = start; year <= max; year += step) {
		ticks.push({ year, left: ((year - min) / span) * 100 });
	}
	return ticks;
}

/** Human label for a tech lane, used by the lane headers and the mobile per-lane labels. */
export const LANE_LABELS: Record<string, string> = {
	'ai-llm': 'AI / LLM',
	'ci-cd': 'CI / CD',
	database: 'Database',
	backend: 'Backend',
	frontend: 'Frontend',
};
