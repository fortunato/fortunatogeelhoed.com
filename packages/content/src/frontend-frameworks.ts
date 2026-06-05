import type { FrameworkExposureSpan } from '@fg/shared';

/** Frontend frameworks/libraries across the career, in roughly chronological order. Drives the
 *  "Frontend Frameworks" ribbon on the homepage. AngularJS and Angular are distinct rows (and
 *  brand colours); Marionette folds into Backbone; Next.js and the 2021 Nuxt project surface
 *  Vue as two-fold. */
const frontendFrameworks: FrameworkExposureSpan[] = [
	{ framework: 'Prototype.js', startYear: 2007, endYear: 2010, intensity: 'occasional' },
	{ framework: 'MooTools', startYear: 2007, endYear: 2010, intensity: 'occasional' },
	{ framework: 'jQuery', startYear: 2007, endYear: 2016, intensity: 'professional' },
	{ framework: 'Ext JS', startYear: 2010, endYear: 2012, intensity: 'occasional' },
	{ framework: 'Backbone', startYear: 2012, endYear: 2016, intensity: 'professional' },
	{ framework: 'AngularJS', startYear: 2013, endYear: 2016, intensity: 'professional' },
	{ framework: 'React', startYear: 2016, endYear: 'present', intensity: 'professional' },
	{ framework: 'Next.js', startYear: 2018, endYear: 'present', intensity: 'occasional' },
	{ framework: 'Angular', startYear: 2019, endYear: 2022, intensity: 'occasional' },
	{ framework: 'Vue', startYear: 2021, endYear: 2021, intensity: 'professional' },
	{ framework: 'Angular', startYear: 2025, endYear: 'present', intensity: 'professional' },
	{ framework: 'Vue', startYear: 2026, endYear: 'present', intensity: 'professional' },
];

export function getFrontendFrameworks(): FrameworkExposureSpan[] {
	return frontendFrameworks;
}
