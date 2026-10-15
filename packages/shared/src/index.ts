export { articlePath, articlePathsFromPosts, WRITING_BASE } from './articles';
export { fetchAvailability, readAvailabilitySeed } from './availability-client';
export { availabilityBadge, availabilityBookedLine } from './availability-copy';
export { initCardSpotlight } from './card-spotlight';
export { consumeSwitchScroll, initSwitchTransition } from './disintegrate';
export type { NavItem } from './nav';
export { NAV_ITEMS } from './nav';
export { initNavMotion, initPopstateMotion, replayEntrance, smoothScrollToTop } from './nav-motion';
export type { ArticleSeoInput, PageSeo } from './seo';
export {
	buildRobotsTxt,
	buildSitemap,
	GITHUB_PROFILE_URL,
	GITHUB_REPO_URL,
	INDEXED_PATHS,
	isIndexedPath,
	LINKEDIN_URL,
	OG_DEFAULT_IMAGE_PATH,
	OG_IMAGE_PATH,
	renderArticleSeoHead,
	renderSeoHead,
	resolvePageSeo,
	SITE_NAME,
	SITE_URL,
} from './seo';
export { destroySmoothScroll, initSmoothScroll } from './smooth-scroll';
export type { TechVisual } from './tech';
export { TECH_REGISTRY, techVisual } from './tech';
export {
	entryMatchesTech,
	formatTechQuery,
	parseTechQuery,
	readTechFilter,
	readTechFilterUrl,
	TECH_SLUG_TO_NAME,
	techNameFromSlug,
	techSlug,
	writeTechFilter,
	writeTechFilterUrl,
} from './tech-filter';
export { TECH_SPRITE } from './tech-sprite';
export { timelineDatetime } from './text';
export type { Theme } from './theme';
export { getCurrentTheme, setTheme, toggleTheme } from './theme';
export type { AxisTick, Bounds, RibbonRow, RibbonSegment } from './timeline-layout';
export {
	AGENCY_LABEL,
	axisTicks,
	EMPLOYMENT_TYPE_LABELS,
	INTENSITY_LEGEND,
	LANE_LABELS,
	ribbonRows,
	spansBounds,
} from './timeline-layout';
export { destroyTimelineMotion, initTimelineMotion } from './timeline-motion';
export type { Article, ContentItem, ContentMeta } from './types/content';
export type {
	HomeContent,
	HomeSectionsCopy,
	Principle,
	ProofPoint,
	ServiceOffering,
	WritingTeaserItem,
} from './types/home';
export type { RouteDefinition } from './types/routes';
export { routes } from './types/routes';
export type {
	Domain,
	EmploymentType,
	ExposureIntensity,
	FrameworkExposureSpan,
	Lane,
	TimelineData,
	TimelineEntry,
	TimelineLink,
	TimelinePageCopy,
	TimelineYear,
} from './types/timeline';
export { DOMAINS, LANES } from './types/timeline';
export { isExternalHref } from './url';
export type { Availability } from './validation/availability';
export { availabilitySchema } from './validation/availability';
