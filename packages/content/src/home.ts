import type { HomeContent } from '@fg/shared';

/** Homepage content. Real and factual — sourced from the CV and positioning
 *  material. The writing teaser links to the blog route (a placeholder until
 *  the blog ships). */
const home: HomeContent = {
	hero: {
		name: 'Fortunato Geelhoed',
		tagline: 'Senior Full-Stack Engineer & Technical Lead',
		statement:
			"I build, fix, and lead across React, Vue, and Angular, quick to pick up whatever's next when it makes sense.",
	},
	sections: {
		services: { label: 'What I do', title: 'Services' },
		proof: { label: 'Proof' },
		frameworks: {
			label: 'Frameworks',
			title: 'Frameworks come and go. The craft compounds.',
			intro: 'Twenty-five years on the web means living through every frontend era and the backends beneath it, staying fluent while the stack reinvents itself.',
		},
		writing: { label: 'Latest writing', title: 'From the blog', readMore: 'Read more' },
	},
	services: [
		{
			title: 'Full-Stack Engineering',
			description:
				'TypeScript end to end: React, NestJS, GraphQL, monorepos. Shipped at scale, in production.',
		},
		{
			title: 'Frontend Architecture',
			description:
				'Design systems, micro-frontends, server-side rendering and component libraries that hold up as teams grow.',
		},
		{
			title: 'AI Integration & Automation',
			description:
				'MCP servers, agentic workflows and AI-augmented development woven into real delivery.',
		},
		{
			title: 'Technical Leadership',
			description:
				'Architecture decisions, mentoring and tech-debt strategy. I lead while staying in the code.',
		},
	],
	proof: [
		{ metric: '5.5 years', label: 'Municipality of Amsterdam, almost fully remote' },
		{ metric: '3×', label: 'Lighthouse gain on the Tele2 sim-only configurator rebuild' },
		{ metric: 'PyPI', label: 'Published library with nex to zero prior Python experience' },
		{
			metric: 'Global',
			label: 'Two decades across the Netherlands, Australia, New Zealand & Spain',
		},
	],
	writing: [
		{
			tag: 'Career',
			title: 'Specialization Is Overrated',
			blurb: "I don't know Python. So I published a library on PyPI.",
			href: '/blog',
		},
		{
			tag: 'AI',
			title: 'Cognitive Debt & Agentic Workflows',
			blurb: "What happens when you ship code you don't fully understand?",
			href: '/blog',
		},
	],
	cta: {
		heading: "Let's build something together.",
		href: '/contact',
		label: 'Get in touch',
	},
};

export function getHomeContent(): HomeContent {
	return home;
}
