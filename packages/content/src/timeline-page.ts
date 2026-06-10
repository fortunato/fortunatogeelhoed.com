import type { TimelinePageCopy } from '@fg/shared';

/** Header copy for the career timeline page. Real and factual, sourced from the
 *  CV and positioning material. Kept here so all three framework variants render
 *  the same words from one source. */
const timelinePage: TimelinePageCopy = {
	label: 'Career',
	title: 'Twenty-five years across the stack',
	intro: "From classic ASP and Flash to React, NestJS and agentic workflows: a working life across the frontend, backend, infrastructure and, lately, AI. In the 2010s I was the frontend specialist teams relied on for the UI; that's where today's React, Angular and Vue depth comes from, and the 2020s broadened it back to full-stack and lead. Across every title, engineer to manager, at least half my time has stayed in the code.",
};

export function getTimelinePage(): TimelinePageCopy {
	return timelinePage;
}
