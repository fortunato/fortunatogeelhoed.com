import { describe, expect, it } from 'vitest';
import {
	type AxisTick,
	type RibbonRow,
	type RibbonSegment,
	axisTicks,
	ribbonRows,
	spansBounds,
} from './timeline-layout';
import type { FrameworkExposureSpan } from './types/timeline';

function span(
	framework: string,
	startYear: number,
	endYear: FrameworkExposureSpan['endYear'],
	intensity: FrameworkExposureSpan['intensity'] = 'professional',
): FrameworkExposureSpan {
	return { framework, startYear, endYear, intensity };
}

describe('spansBounds', () => {
	it('returns the earliest start and the latest end plus a year of headroom', () => {
		const bounds = spansBounds([span('React', 2015, 2020), span('Vue', 2018, 2022)]);
		expect(bounds).toEqual({ min: 2015, max: 2023 });
	});

	it('treats a present end as open and bounds on the started years only', () => {
		const bounds = spansBounds([span('React', 2016, 'present')]);
		expect(bounds).toEqual({ min: 2016, max: 2017 });
	});

	it('spans across multiple lists sharing one axis', () => {
		const frontend = [span('React', 2014, 2019)];
		const backend = [span('Node', 2012, 2021)];
		expect(spansBounds(frontend, backend)).toEqual({ min: 2012, max: 2022 });
	});
});

describe('ribbonRows', () => {
	const bounds = { min: 2010, max: 2020 }; // span of 10 years

	it('groups segments by framework in first-seen order', () => {
		const rows = ribbonRows(
			[span('Vue', 2010, 2015), span('React', 2012, 2014), span('Vue', 2016, 2018)],
			bounds,
		) as [RibbonRow, RibbonRow];
		expect(rows.map((r) => r.framework)).toEqual(['Vue', 'React']);
		expect(rows[0].segments).toHaveLength(2);
		expect(rows[1].segments).toHaveLength(1);
	});

	it('positions a span as a left offset and width in percent of the axis', () => {
		const [row] = ribbonRows([span('React', 2012, 2017)], bounds) as [RibbonRow];
		const [segment] = row.segments as [RibbonSegment];
		expect(segment.left).toBeCloseTo(20); // (2012-2010)/10 * 100
		expect(segment.width).toBeCloseTo(50); // (2017-2012)/10 * 100
	});

	it('resolves a present end to the axis max', () => {
		const [row] = ribbonRows([span('React', 2015, 'present')], bounds) as [RibbonRow];
		const [segment] = row.segments as [RibbonSegment];
		expect(segment.left).toBeCloseTo(50);
		expect(segment.width).toBeCloseTo(50); // (2020-2015)/10 * 100
	});

	it('floors a non-brief bar to a minimum readable width', () => {
		const [row] = ribbonRows([span('React', 2015, 2015)], bounds) as [RibbonRow]; // zero-length span
		const [segment] = row.segments as [RibbonSegment];
		expect(segment.width).toBe(2);
	});

	it('pulls a floored bar back so it never overflows the right edge', () => {
		const [row] = ribbonRows([span('React', 2020, 2020)], bounds) as [RibbonRow]; // at the very edge
		const [segment] = row.segments as [RibbonSegment];
		expect(segment.left + segment.width).toBeLessThanOrEqual(100);
		expect(segment.width).toBe(2);
		expect(segment.left).toBe(98);
	});

	it('does not floor or clamp a brief segment (rendered as a fixed-size dot)', () => {
		const [row] = ribbonRows([span('React', 2020, 2020, 'brief')], bounds) as [RibbonRow];
		const [segment] = row.segments as [RibbonSegment];
		expect(segment.intensity).toBe('brief');
		expect(segment.width).toBe(0); // left untouched at the edge
		expect(segment.left).toBeCloseTo(100);
	});

	it('avoids a divide-by-zero when min equals max', () => {
		const [row] = ribbonRows([span('React', 2010, 2010)], { min: 2010, max: 2010 }) as [
			RibbonRow,
		];
		const [segment] = row.segments as [RibbonSegment];
		expect(Number.isFinite(segment.left)).toBe(true);
		expect(Number.isFinite(segment.width)).toBe(true);
	});

	it('returns no rows for an empty span list', () => {
		expect(ribbonRows([], bounds)).toEqual([]);
	});
});

describe('axisTicks', () => {
	it('emits evenly spaced markers aligned to the step across the bounds', () => {
		const ticks = axisTicks({ min: 2010, max: 2020 }, 5) as [AxisTick, AxisTick, AxisTick];
		expect(ticks.map((t) => t.year)).toEqual([2010, 2015, 2020]);
		expect(ticks[0].left).toBeCloseTo(0);
		expect(ticks[1].left).toBeCloseTo(50);
		expect(ticks[2].left).toBeCloseTo(100);
	});

	it('starts at the first step boundary at or after min', () => {
		const ticks = axisTicks({ min: 2012, max: 2021 }, 5);
		expect(ticks.map((t) => t.year)).toEqual([2015, 2020]);
	});

	it('defaults to a five-year step', () => {
		const ticks = axisTicks({ min: 2000, max: 2010 });
		expect(ticks.map((t) => t.year)).toEqual([2000, 2005, 2010]);
	});
});
