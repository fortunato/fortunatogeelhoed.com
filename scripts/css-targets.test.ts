import { describe, expect, it } from 'vitest';
import { cssTargets } from './css-targets';

// The shared lightningcss targets are derived once from the repo-root browserslist so the
// lightningcss and Angular CSS pipelines prefix/downlevel to the same floor. Pin that the
// resolution produces a concrete, non-empty target set rather than silently collapsing.
describe('cssTargets', () => {
	it('resolves to a non-empty browser-target set', () => {
		expect(cssTargets).toBeTypeOf('object');
		expect(cssTargets).not.toBeNull();
		expect(Object.keys(cssTargets).length).toBeGreaterThan(0);
	});
});
