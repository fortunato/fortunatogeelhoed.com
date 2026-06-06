import type { FrameworkExposureSpan } from '@fg/shared';

/** Backend frameworks & CMS platforms across the career (raw languages live on the per-role
 *  timeline lanes, not here). Drives the "Backend & CMS" ribbon on the homepage. The Spring
 *  Boot consulting work was a discrete early-2026 engagement (a dot); Hono is the current
 *  portfolio, placed slightly later in 2026 so it reads as the latest, ongoing work. */
const backendFrameworks: FrameworkExposureSpan[] = [
	{ framework: 'Seagull', startYear: 2007, endYear: 2010, intensity: 'occasional' },
	{ framework: 'Joomla', startYear: 2007, endYear: 2012, intensity: 'professional' },
	{ framework: 'Magento', startYear: 2007, endYear: 2012, intensity: 'professional' },
	{ framework: 'Wordpress', startYear: 2008, endYear: 2015, intensity: 'occasional' },
	{ framework: 'SnappCMS', startYear: 2010, endYear: 2012, intensity: 'occasional' },
	{ framework: 'Kohana', startYear: 2012, endYear: 2013, intensity: 'occasional' },
	{ framework: 'Sitecore', startYear: 2013, endYear: 2017, intensity: 'professional' },
	{ framework: 'AEM', startYear: 2013, endYear: 2017, intensity: 'occasional' },
	{ framework: 'Magento 2', startYear: 2016, endYear: 2019, intensity: 'occasional' },
	{ framework: 'Express', startYear: 2016, endYear: 'present', intensity: 'professional' },
	{ framework: 'NestJS', startYear: 2020, endYear: 'present', intensity: 'professional' },
	{ framework: 'Symfony', startYear: 2009, endYear: 2009, intensity: 'brief' },
	{ framework: 'Symfony', startYear: 2020, endYear: 2025, intensity: 'occasional' },
	{ framework: 'Spring Boot', startYear: 2026, endYear: 2026, intensity: 'brief' },
	{ framework: 'Hono', startYear: 2026.5, endYear: 'present', intensity: 'professional' },
];

export function getBackendFrameworks(): FrameworkExposureSpan[] {
	return backendFrameworks;
}
