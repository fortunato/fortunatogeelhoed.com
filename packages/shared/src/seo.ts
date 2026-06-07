// Canonical, indexed origin. The React build is the only variant a crawler ever sees: a request
// with no `framework` cookie is served React by default, and the Vue/Angular variants live behind
// the same URLs (switched only by an explicit cookie), so they are never separately crawled.
export const SITE_URL = 'https://fortunatogeelhoed.com';
export const SITE_NAME = 'Fortunato Geelhoed';
export const OG_IMAGE_PATH = '/assets/images/fortunato.webp';

// The pages worth surfacing to search engines. The remaining scaffolded routes
// (/services, /work, /blog) are deferred placeholders, so they are kept out of the sitemap
// and marked noindex rather than competing for crawl budget with thin content.
export const INDEXED_PATHS = ['/', '/about', '/timeline', '/contact'];

export function isIndexedPath(path: string): boolean {
	return INDEXED_PATHS.includes(path);
}

export const GITHUB_PROFILE_URL = 'https://github.com/fortunato';
export const GITHUB_REPO_URL = 'https://github.com/fortunato/fortunatogeelhoed.com';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/fortunatogeelhoed/';

export interface PageSeo {
	title: string;
	description: string;
}

const DEFAULT_DESCRIPTION =
	'Freelance senior full-stack and TypeScript engineer (React, Vue, Angular) on the Costa Blanca, Spain. 25 years shipping for the web.';

// Per-route titles and descriptions, hand-tuned for the terms worth ranking on: the freelance
// framing, the framework triad, the local angle (Costa Blanca / Spain), and the stack. Routes
// absent here fall back to their page content, then to the site default.
const SEO_BY_PATH: Record<string, PageSeo> = {
	'/': {
		title: 'Freelance TypeScript Engineer (React, Vue, Angular) | Fortunato Geelhoed, Costa Blanca',
		description: DEFAULT_DESCRIPTION,
	},
	'/about': {
		title: 'About Fortunato Geelhoed | Freelance Full-Stack Engineer, Costa Blanca',
		description:
			'Senior full-stack and TypeScript engineer freelancing from the Costa Blanca, Spain. Full-stack since before it was fashionable; React, Vue, and Angular; quality- and test-first.',
	},
	'/timeline': {
		title: 'Career Timeline: 25 Years Building the Web | Fortunato Geelhoed',
		description:
			'A 25-year career building for the web: frontend, backend, CI/CD, databases, and AI/LLM work across React, Angular, Vue, Node.js, and more.',
	},
	'/contact': {
		title: 'Contact | Hire Fortunato Geelhoed, Freelance TypeScript Developer',
		description:
			'Get in touch to work with a freelance senior full-stack and TypeScript engineer (React, Vue, Angular), available remotely from the Costa Blanca, Spain.',
	},
};

/** Resolve the title/description for a route, preferring tuned overrides, then page content,
 *  then the site default. `fallback` is the route's own content (title/description). */
export function resolvePageSeo(path: string, fallback?: Partial<PageSeo>): PageSeo {
	const tuned = SEO_BY_PATH[path];
	if (tuned) return tuned;
	const title = fallback?.title ? `${fallback.title} | ${SITE_NAME}` : SITE_NAME;
	return { title, description: fallback?.description || DEFAULT_DESCRIPTION };
}

// Structured data describing Fortunato as a freelance professional: the single strongest signal
// for "who is this, what do they do, and where": the freelance framing, the skill set, and the
// Costa Blanca / Spain location. Emitted on every indexed page.
const PERSON_JSONLD = {
	'@context': 'https://schema.org',
	'@type': 'Person',
	name: SITE_NAME,
	url: SITE_URL,
	image: `${SITE_URL}${OG_IMAGE_PATH}`,
	jobTitle: ['Freelance Senior Full-Stack & TypeScript Engineer', 'Technical Lead'],
	worksFor: { '@type': 'Organization', name: 'JiggyBit S.L.' },
	address: {
		'@type': 'PostalAddress',
		addressRegion: 'Comunidad Valenciana',
		addressLocality: 'Costa Blanca',
		addressCountry: 'ES',
	},
	areaServed: ['Costa Blanca', 'Alicante', 'Spain', 'Europe', 'Remote'],
	knowsAbout: [
		'TypeScript',
		'JavaScript',
		'React',
		'Vue',
		'Angular',
		'Node.js',
		'Web Components',
		'CSS',
		'Server-side rendering',
		'Design systems',
		'Frontend architecture',
		'Technical leadership',
		'Mentoring',
		'Technical strategy',
		'Performance optimisation',
		'CI/CD',
		'Databases',
		'AI and LLM integration',
	],
	sameAs: [GITHUB_PROFILE_URL, LINKEDIN_URL],
};

// Escape for use inside double-quoted HTML attributes and text nodes.
function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** The full <head> SEO block for a route: title, description, canonical, Open Graph, Twitter
 *  card, and the Person JSON-LD. Returned as an HTML string for the prerender step to inject. */
export function renderSeoHead(path: string, seo: PageSeo): string {
	const title = escapeHtml(seo.title);
	const description = escapeHtml(seo.description);

	// Deferred placeholder pages: enough head for a sensible browser tab, but kept out of the
	// index (and without canonical/social/structured data) so they don't dilute the real pages.
	if (!isIndexedPath(path)) {
		return [
			`<title>${title}</title>`,
			`<meta name="description" content="${description}">`,
			`<meta name="robots" content="noindex,follow">`,
		].join('\n\t');
	}

	const canonical = `${SITE_URL}${path === '/' ? '/' : path}`;
	const image = `${SITE_URL}${OG_IMAGE_PATH}`;
	// Guard the JSON-LD against premature </script> termination.
	const jsonLd = JSON.stringify(PERSON_JSONLD).replace(/</g, '\\u003c');

	return [
		`<title>${title}</title>`,
		`<meta name="description" content="${description}">`,
		`<link rel="canonical" href="${canonical}">`,
		`<meta property="og:type" content="website">`,
		`<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">`,
		`<meta property="og:title" content="${title}">`,
		`<meta property="og:description" content="${description}">`,
		`<meta property="og:url" content="${canonical}">`,
		`<meta property="og:image" content="${image}">`,
		`<meta name="twitter:card" content="summary_large_image">`,
		`<meta name="twitter:title" content="${title}">`,
		`<meta name="twitter:description" content="${description}">`,
		`<meta name="twitter:image" content="${image}">`,
		`<script type="application/ld+json">${jsonLd}</script>`,
	].join('\n\t');
}

/** robots.txt allowing indexing and pointing crawlers at the sitemap. */
export function buildRobotsTxt(): string {
	return `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

/** sitemap.xml of the indexed routes, as absolute canonical URLs. */
export function buildSitemap(): string {
	const urls = INDEXED_PATHS.map((path) => {
		const loc = `${SITE_URL}${path === '/' ? '/' : path}`;
		return `\t<url><loc>${loc}</loc></url>`;
	}).join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
