export type { ContentMeta, ContentItem } from './types/content';
export type { RouteDefinition } from './types/routes';
export { routes } from './types/routes';
export type {
	Lane,
	EmploymentType,
	ExposureIntensity,
	TimelineYear,
	TimelineEntry,
	FrameworkExposureSpan,
	TimelineData,
} from './types/timeline';
export { LANES } from './types/timeline';
export type { Bounds, RibbonSegment, RibbonRow, AxisTick } from './timeline-layout';
export { spansBounds, ribbonRows, axisTicks, LANE_LABELS } from './timeline-layout';
export type { NavItem } from './nav';
export { NAV_ITEMS } from './nav';
export type { TechVisual } from './tech';
export { TECH_REGISTRY, techVisual } from './tech';
export { TECH_SPRITE } from './tech-sprite';
export type { HomeContent, ServiceOffering, ProofPoint, WritingTeaserItem } from './types/home';
export type { Theme } from './theme';
export { getCurrentTheme, setTheme, toggleTheme } from './theme';
export { initSwitchTransition } from './disintegrate';
export { initSmoothScroll, destroySmoothScroll } from './smooth-scroll';
export { initTimelineMotion, destroyTimelineMotion } from './timeline-motion';
export { initCardSpotlight } from './card-spotlight';
export type { Availability } from './validation/availability';
export { availabilitySchema } from './validation/availability';
export { availabilityBadge, availabilityBookedLine } from './availability-copy';
export { readAvailabilitySeed, fetchAvailability } from './availability-client';
