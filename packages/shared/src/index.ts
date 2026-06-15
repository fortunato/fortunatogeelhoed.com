export type { ContentMeta, ContentItem, Article } from './types/content';
export type { RouteDefinition } from './types/routes';
export { routes } from './types/routes';
export { WRITING_BASE, articlePath, articlePathsFromPosts } from './articles';
export type {
	Lane,
	EmploymentType,
	Domain,
	ExposureIntensity,
	TimelineYear,
	TimelineEntry,
	TimelineLink,
	FrameworkExposureSpan,
	TimelineData,
	TimelinePageCopy,
} from './types/timeline';
export { LANES, DOMAINS } from './types/timeline';
export type { Bounds, RibbonSegment, RibbonRow, AxisTick } from './timeline-layout';
export {
	spansBounds,
	ribbonRows,
	axisTicks,
	LANE_LABELS,
	EMPLOYMENT_TYPE_LABELS,
	AGENCY_LABEL,
	INTENSITY_LEGEND,
} from './timeline-layout';
export type { NavItem } from './nav';
export { NAV_ITEMS } from './nav';
export { timelineDatetime } from './text';
export { isExternalHref } from './url';
export type { PageSeo } from './seo';
export {
	SITE_URL,
	SITE_NAME,
	OG_IMAGE_PATH,
	OG_DEFAULT_IMAGE_PATH,
	GITHUB_PROFILE_URL,
	GITHUB_REPO_URL,
	LINKEDIN_URL,
	INDEXED_PATHS,
	isIndexedPath,
	resolvePageSeo,
	renderSeoHead,
	renderArticleSeoHead,
	buildRobotsTxt,
	buildSitemap,
} from './seo';
export type { ArticleSeoInput } from './seo';
export type { TechVisual } from './tech';
export { TECH_REGISTRY, techVisual } from './tech';
export {
	techSlug,
	techNameFromSlug,
	TECH_SLUG_TO_NAME,
	entryMatchesTech,
	parseTechQuery,
	formatTechQuery,
	readTechFilter,
	writeTechFilter,
	readTechFilterUrl,
	writeTechFilterUrl,
} from './tech-filter';
export { TECH_SPRITE } from './tech-sprite';
export type {
	HomeContent,
	HomeSectionsCopy,
	ServiceOffering,
	Principle,
	ProofPoint,
	WritingTeaserItem,
} from './types/home';
export type { Theme } from './theme';
export { getCurrentTheme, setTheme, toggleTheme } from './theme';
export { consumeSwitchScroll, initSwitchTransition } from './disintegrate';
export { initNavMotion, initPopstateMotion, replayEntrance, smoothScrollToTop } from './nav-motion';
export { initSmoothScroll, destroySmoothScroll } from './smooth-scroll';
export { initTimelineMotion, destroyTimelineMotion } from './timeline-motion';
export { initCardSpotlight } from './card-spotlight';
export type { Availability } from './validation/availability';
export { availabilitySchema } from './validation/availability';
export { availabilityBadge, availabilityBookedLine } from './availability-copy';
export { readAvailabilitySeed, fetchAvailability } from './availability-client';
