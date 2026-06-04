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
export type { RibbonSegment, RibbonRow, AxisTick } from './timeline-layout';
export { timelineBounds, ribbonRows, axisTicks, LANE_LABELS } from './timeline-layout';
export type { NavItem } from './nav';
export { NAV_ITEMS } from './nav';
export type { HomeContent, ServiceOffering, ProofPoint, WritingTeaserItem } from './types/home';
export type { Theme } from './theme';
export { getCurrentTheme, setTheme, toggleTheme } from './theme';
export { initSwitchTransition } from './disintegrate';
export { initSmoothScroll, destroySmoothScroll } from './smooth-scroll';
