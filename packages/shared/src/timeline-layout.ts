import type { ExposureIntensity, FrameworkExposureSpan, TimelineYear } from './types/timeline';

// Pure layout maths for the framework ribbons, shared by all three variants so the ribbon
// rows and axis are positioned identically everywhere (no per-framework drift). No DOM.

export interface Bounds {
	min: number;
	max: number;
}

function toNumber(year: TimelineYear, present: number): number {
	return year === 'present' ? present : year;
}

/** Earliest and latest year across one or more framework span lists. Pass every list that
 *  shares an axis (e.g. the frontend and backend ribbons) so they line up on the same scale.
 *  A year of right-edge headroom keeps just-started / current spans off the very edge. */
export function spansBounds(...lists: FrameworkExposureSpan[][]): Bounds {
	const years: number[] = [];
	for (const list of lists) {
		for (const span of list) {
			years.push(span.startYear);
			if (span.endYear !== 'present') years.push(span.endYear);
		}
	}
	return { min: Math.min(...years), max: Math.max(...years) + 1 };
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

/** Minimum bar width (percent) so a single-year span, or one that only just started, still
 *  reads as a bar rather than collapsing to nothing. `brief` ignores width (renders as a dot). */
const MIN_SEG_WIDTH = 2;

/** One row per framework (in first-seen order), each span positioned along `bounds`. Pass the
 *  shared bounds (from spansBounds) so multiple ribbons align on one axis. */
export function ribbonRows(spans: FrameworkExposureSpan[], bounds: Bounds): RibbonRow[] {
	const { min, max } = bounds;
	const span = max - min || 1;
	const byFramework = new Map<string, RibbonSegment[]>();

	for (const exposure of spans) {
		const end = toNumber(exposure.endYear, max);
		let left = ((exposure.startYear - min) / span) * 100;
		let width = ((end - exposure.startYear) / span) * 100;
		if (exposure.intensity !== 'brief') {
			width = Math.max(width, MIN_SEG_WIDTH);
			if (left + width > 100) left = 100 - width; // keep the floored bar on the track
		}
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

/** Evenly spaced year markers (default every 5 years) across `bounds`. */
export function axisTicks(bounds: Bounds, step = 5): AxisTick[] {
	const { min, max } = bounds;
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
	frontend: 'Frontend',
	backend: 'Backend / DB',
	cicd: 'CI/CD & Infra',
	ai: 'AI / LLM',
};
