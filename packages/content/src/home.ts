import type { HomeContent } from '@fg/shared';

/** Homepage content. Real and factual — sourced from the CV and positioning
 *  material. The writing teaser links to the blog route (a placeholder until
 *  the blog ships). */
const home: HomeContent = {
	hero: {
		name: 'Fortunato Geelhoed',
		tagline: 'Senior Full-Stack Engineer & Technical Lead',
		statement: 'I build, fix, and lead TypeScript platforms.',
	},
	services: [
		{
			title: 'Full-Stack Engineering',
			description:
				'TypeScript end to end — React, NestJS, GraphQL, monorepos. Shipped at scale, in production.',
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
		{ metric: '5.5 years', label: 'Municipality of Amsterdam, fully remote' },
		{ metric: '3×', label: 'Lighthouse gain on the Tele2 e-commerce rebuild' },
		{ metric: 'PyPI', label: 'Published library with zero prior Python experience' },
	],
	writing: [
		{
			title: 'Specialization Is Overrated',
			blurb: "I don't know Python. So I published a library on PyPI.",
			href: '/blog',
		},
		{
			title: 'Cognitive Debt & Agentic Workflows',
			blurb: "What happens when you ship code you don't fully understand?",
			href: '/blog',
		},
	],
	cta: {
		heading: "Let's build something together.",
		href: '/contact',
	},
};

export function getHomeContent(): HomeContent {
	return home;
}
