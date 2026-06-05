// Generates the timeline's tech-icon sprite + brand registry from the `simple-icons`
// package (official brand glyphs + colors), so the pills use real logos instead of
// hand-drawn approximations. Techs not in the set (or trademark-removed) fall back to a
// coloured text pill via BRAND_FALLBACK. Output: packages/shared/src/tech-icons.generated.ts
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as simpleIcons from 'simple-icons';

// tech name → simple-icons slug (null = no glyph, render a text pill)
const SLUGS: Record<string, string | null> = {
	// Frontend
	React: 'react',
	Angular: 'angular',
	Vue: 'vuedotjs',
	AngularJS: null,
	TypeScript: 'typescript',
	'TypeScript/Flow': 'typescript',
	Redux: 'redux',
	Webpack: 'webpack',
	Vite: 'vite',
	Storybook: 'storybook',
	Nx: 'nx',
	GraphQL: 'graphql',
	'Mantine UI': 'mantine',
	Recharts: null,
	RxJS: 'reactivex',
	'lightweight-charts': 'tradingview',
	Anychart: null,
	'Next.js': 'nextdotjs',
	jQuery: 'jquery',
	Backbone: 'backbonedotjs',
	Marionette: 'backbonedotjs',
	RequireJS: null,
	'Ext JS': 'sencha',
	'Prototype.js': null,
	MooTools: null,
	Highcharts: 'highcharts',
	JavaScript: 'javascript',
	ES2016: 'javascript',
	SCSS: 'sass',
	'SCSS Modules': 'sass',
	'CSS Modules': 'css',
	'Styled Components': 'styledcomponents',
	SSR: null,
	Flash: null,
	'XML/XSLT': null,
	'HTML / CSS': 'html5',
	'XHTML / CSS': 'html5',
	HTML5: 'html5',
	HTML: 'html5',
	CSS: 'css',
	CSS2: 'css',
	CSS3: 'css',
	XHTML: null,
	XML: null,
	XSLT: null,
	AJAX: null,
	// Backend / DB
	Bun: 'bun',
	Hono: 'hono',
	'Node.js': 'nodedotjs',
	NestJS: 'nestjs',
	Express: 'express',
	Azure: 'microsoftazure',
	AKS: null,
	'App Insights': null,
	'Blob Storage': null,
	'Azure Service Bus': null,
	Java: 'openjdk',
	'Spring Boot': 'springboot',
	Salesforce: 'salesforce',
	AEM: null,
	Sitecore: 'sitecore',
	PostgreSQL: 'postgresql',
	PostGIS: 'postgresql',
	MySQL: 'mysql',
	TimescaleDB: 'timescale',
	'SQL Server': 'microsoftsqlserver',
	'MS Access': null,
	WebSockets: 'socketdotio',
	PHP: 'php',
	'Classic ASP': null,
	'ASP.NET': 'dotnet',
	Joomla: 'joomla',
	'Joomla 1': 'joomla',
	'Joomla 2': 'joomla',
	Magento: 'magento',
	Kohana: null,
	'Custom CMS': null,
	PEAR: null,
	Seagull: null,
	Python: 'python',
	PyPI: 'pypi',
	// CI/CD & infra
	'GitHub Actions': 'githubactions',
	'GitLab CI': 'gitlab',
	'Azure Pipelines': 'azuredevops',
	'Gitea Actions': 'gitea',
	Docker: 'docker',
	Jenkins: 'jenkins',
	Bamboo: 'bamboo',
	Bitbucket: 'bitbucket',
	Mercurial: 'mercurial',
	'Amazon EC2': 'amazonec2',
	SVN: 'subversion',
	Capistrano: null,
	rsync: null,
	Bash: 'gnubash',
	SFTP: null,
	'Visual SourceSafe': null,
	FTP: null,
	Pulumi: 'pulumi',
	k3s: 'k3s',
	Grunt: 'grunt',
	Gulp: 'gulp',
	Yeoman: null,
	Middleman: null,
	// AI / LLM
	'Claude Code': 'claude',
	Ollama: 'ollama',
	MCP: null,
	OpenClaw: null,
	Copilot: 'githubcopilot',
	ChatGPT: 'openai',
	'ChatGPT API': 'openai',
};

// brand colors for techs without a simple-icons glyph (keeps the pills on-brand).
const BRAND_FALLBACK: Record<string, string> = {
	AngularJS: '#b52e31',
	Recharts: '#8884d8',
	Anychart: '#e8623c',
	SSR: '#888888',
	Flash: '#cc0000',
	'XML/XSLT': '#e34c26',
	XHTML: '#e34c26',
	XML: '#005a9c',
	XSLT: '#eb8a2f',
	AJAX: '#888888',
	AEM: '#eb1000',
	Sitecore: '#eb1f1f',
	'MS Access': '#a4373a',
	'Classic ASP': '#cc2927',
	Azure: '#0078d4',
	AKS: '#326ce5',
	'App Insights': '#0078d4',
	'Blob Storage': '#0078d4',
	'Azure Service Bus': '#0078d4',
	'Azure Pipelines': '#0078d7',
	'Amazon EC2': '#ff9900',
	'SQL Server': '#cc2927',
	Salesforce: '#00a1e0',
	Marionette: '#888888',
	RequireJS: '#809cc9',
	'Prototype.js': '#888888',
	MooTools: '#888888',
	Bamboo: '#0052cc',
	'Visual SourceSafe': '#68217a',
	FTP: '#888888',
	MCP: '#d97706',
	OpenClaw: '#888888',
	ChatGPT: '#74aa9c',
	'ChatGPT API': '#74aa9c',
	Magento: '#ee672f',
	Kohana: '#dd2a1b',
	'Custom CMS': '#6b7280',
	PEAR: '#67452e',
	Seagull: '#5b8a3a',
	Capistrano: '#d24b32',
	rsync: '#3a6ea5',
	SFTP: '#3a6ea5',
	Yeoman: '#ffbf00',
	Middleman: '#9c5b8b',
};

// Original hand-drawn glyphs composed from primitives — own artwork, NOT brand logos. Used
// for tools with no simple-icons entry, and as neutral category marks (cloud / database /
// layers / chat) for brands whose logos were pulled from the icon ecosystem for trademark
// reasons; we represent the category rather than reproduce the trademarked mark. Each is
// emitted into the sprite and wired into the registry, overriding any text-pill fallback.
const STROKE =
	'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
const GLYPHS = {
	crab:
		`<symbol id="i-crab" ${STROKE}>` +
		'<ellipse cx="12" cy="14" rx="6" ry="4"/>' +
		'<path d="M10 10.4V8"/><circle cx="10" cy="6.9" r="1"/>' +
		'<path d="M14 10.4V8"/><circle cx="14" cy="6.9" r="1"/>' +
		'<circle cx="4.6" cy="11" r="2"/><path d="M6.4 12.2 7.4 13.4"/>' +
		'<circle cx="19.4" cy="11" r="2"/><path d="M17.6 12.2 16.6 13.4"/>' +
		'<path d="M6.6 16.6 4.7 18.6M9 17.6 8.1 20M15 17.6 15.9 20M17.4 16.6 19.3 18.6"/>' +
		'</symbol>',
	cloud: `<symbol id="i-cloud" ${STROKE}><path d="M7 18a4.2 4.2 0 0 1-.6-8.36 5.5 5.5 0 0 1 10.7-.86A3.75 3.75 0 0 1 17 18Z"/></symbol>`,
	database:
		`<symbol id="i-database" ${STROKE}>` +
		'<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/>' +
		'<path d="M4.5 5.5v13c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8v-13"/>' +
		'<path d="M4.5 12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8"/>' +
		'</symbol>',
	layers:
		`<symbol id="i-layers" ${STROKE}>` +
		'<path d="m12 2.5 9 4.75-9 4.75-9-4.75z"/>' +
		'<path d="m3 12 9 4.75L21 12"/>' +
		'<path d="m3 16.5 9 4.75 9-4.75"/>' +
		'</symbol>',
	chat:
		`<symbol id="i-chat" ${STROKE}>` +
		'<path d="M20.5 11.5a8 8 0 0 1-8.5 8 9 9 0 0 1-3.6-.75L3.5 20.5l1.75-4.9A8 8 0 1 1 20.5 11.5Z"/>' +
		'</symbol>',
} as const;

const CUSTOM_GLYPHS: Record<string, { id: keyof typeof GLYPHS; brand: string }> = {
	OpenClaw: { id: 'crab', brand: '#d97706' },
	Azure: { id: 'cloud', brand: '#0078d4' },
	AKS: { id: 'cloud', brand: '#326ce5' },
	'App Insights': { id: 'cloud', brand: '#0078d4' },
	'Blob Storage': { id: 'cloud', brand: '#0078d4' },
	'Azure Service Bus': { id: 'cloud', brand: '#0078d4' },
	'Azure Pipelines': { id: 'cloud', brand: '#0078d7' },
	'SQL Server': { id: 'database', brand: '#cc2927' },
	AEM: { id: 'layers', brand: '#eb1000' },
	ChatGPT: { id: 'chat', brand: '#74aa9c' },
	'ChatGPT API': { id: 'chat', brand: '#74aa9c' },
};

interface SimpleIcon {
	slug: string;
	hex: string;
	path: string;
}
const icons = simpleIcons as unknown as Record<string, SimpleIcon | undefined>;

function exportName(slug: string): string {
	return `si${slug[0].toUpperCase()}${slug.slice(1)}`;
}

const registry: Record<string, { brand: string; icon?: string }> = {};
const symbols = new Map<string, string>();

for (const [name, slug] of Object.entries(SLUGS)) {
	const icon = slug ? icons[exportName(slug)] : undefined;
	if (icon) {
		registry[name] = { brand: `#${icon.hex}`, icon: icon.slug };
		if (!symbols.has(icon.slug)) {
			symbols.set(
				icon.slug,
				`<symbol id="i-${icon.slug}" viewBox="0 0 24 24"><path fill="currentColor" d="${icon.path}"/></symbol>`,
			);
		}
	} else {
		registry[name] = { brand: BRAND_FALLBACK[name] ?? '#888888' };
	}
}

// Wire the custom hand-drawn glyphs into the sprite + registry (overrides text fallbacks).
for (const [name, glyph] of Object.entries(CUSTOM_GLYPHS)) {
	registry[name] = { brand: glyph.brand, icon: glyph.id };
	symbols.set(glyph.id, GLYPHS[glyph.id]);
}

// A clean git-branch glyph (not a brand logo) for the side-project branch marker.
symbols.set(
	'branch',
	`<symbol id="i-branch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></symbol>`,
);

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">${[...symbols.values()].join('')}</svg>`;

const file = `// GENERATED by scripts/build-tech-icons.ts — do not edit by hand.
// Brand glyphs + colors sourced from the simple-icons package.
export const TECH_REGISTRY: Record<string, { brand: string; icon?: string }> = ${JSON.stringify(registry, null, '\t')};

export const TECH_SPRITE =
	${JSON.stringify(sprite)};
`;

await writeFile(
	resolve(import.meta.dirname, '../packages/shared/src/tech-icons.generated.ts'),
	file,
);
console.log(`✓ Built tech icons (${symbols.size} glyphs, ${Object.keys(registry).length} techs)`);
