// Technology visuals for the timeline: an inline SVG sprite (so `currentColor` brand
// tinting works) plus a name → { brand, icon } registry. Pills reference the sprite via
// <use href="#i-<icon>">. Techs without an icon render as a brand-tinted text pill.

export interface TechVisual {
	brand: string;
	/** Sprite symbol id suffix (referenced as `#i-<icon>`), if the tech has a glyph. */
	icon?: string;
}

export const TECH_REGISTRY: Record<string, TechVisual> = {
	// Frontend
	React: { brand: '#61dafb', icon: 'react' },
	Angular: { brand: '#dd1b16', icon: 'angular' },
	AngularJS: { brand: '#b52e31', icon: 'angular' },
	Vue: { brand: '#42b883', icon: 'vue' },
	TypeScript: { brand: '#3178c6', icon: 'ts' },
	'TypeScript/Flow': { brand: '#3178c6', icon: 'ts' },
	Redux: { brand: '#764abc', icon: 'redux' },
	Webpack: { brand: '#8dd6f9', icon: 'webpack' },
	Vite: { brand: '#646cff', icon: 'vite' },
	Storybook: { brand: '#ff4785', icon: 'storybook' },
	Nx: { brand: '#143055', icon: 'nx' },
	GraphQL: { brand: '#e10098', icon: 'gql' },
	'Mantine UI': { brand: '#339af0', icon: 'mantine' },
	Recharts: { brand: '#8884d8' },
	Anychart: { brand: '#e8623c' },
	'Next.js': { brand: '#999999' },
	jQuery: { brand: '#0769ad' },
	Backbone: { brand: '#0071b5' },
	Marionette: { brand: '#999999' },
	RequireJS: { brand: '#809cc9' },
	'Prototype.js': { brand: '#999999' },
	MooTools: { brand: '#888888' },
	Highcharts: { brand: '#8087e8' },
	JavaScript: { brand: '#f7df1e' },
	ES2016: { brand: '#f7df1e' },
	SCSS: { brand: '#cc6699' },
	'SCSS Modules': { brand: '#cc6699' },
	SSR: { brand: '#888888' },
	Flash: { brand: '#cc0000' },
	'XML/XSLT': { brand: '#e34c26' },
	'HTML / CSS': { brand: '#e34c26' },
	'XHTML / CSS': { brand: '#e34c26' },
	AJAX: { brand: '#888888' },

	// Backend / DB
	Bun: { brand: '#f9e1c3', icon: 'node' },
	Hono: { brand: '#e36002' },
	'Node.js': { brand: '#339933', icon: 'node' },
	NestJS: { brand: '#e0234e', icon: 'nest' },
	Express: { brand: '#888888' },
	Azure: { brand: '#0078d4', icon: 'azure' },
	Java: { brand: '#ed272c', icon: 'java' },
	'Spring Boot': { brand: '#6db33f', icon: 'spring' },
	Salesforce: { brand: '#00a1e0', icon: 'sf' },
	AEM: { brand: '#eb1000' },
	Sitecore: { brand: '#eb1f1f' },
	PostgreSQL: { brand: '#336791', icon: 'pg' },
	PostGIS: { brand: '#336791', icon: 'pg' },
	MySQL: { brand: '#4479a1', icon: 'mysql' },
	TimescaleDB: { brand: '#fdb515', icon: 'tsdb' },
	'SQL Server': { brand: '#cc2927' },
	'MS Access': { brand: '#a4373a' },
	WebSockets: { brand: '#eb6864', icon: 'ws' },
	PHP: { brand: '#777bb4', icon: 'php' },
	'Classic ASP': { brand: '#cc2927' },
	Python: { brand: '#3776ab' },
	PyPI: { brand: '#3775a9' },

	// CI/CD & infra
	'GitHub Actions': { brand: '#2088ff', icon: 'git' },
	'GitLab CI': { brand: '#fc6d26', icon: 'gitlab' },
	'Azure Pipelines': { brand: '#0078d7', icon: 'azure' },
	'Gitea Actions': { brand: '#609926', icon: 'git' },
	Docker: { brand: '#2496ed', icon: 'docker' },
	Jenkins: { brand: '#d24939', icon: 'jenkins' },
	Bamboo: { brand: '#0052cc', icon: 'bamboo' },
	Bitbucket: { brand: '#205081', icon: 'bb' },
	Mercurial: { brand: '#999999' },
	'Amazon EC2': { brand: '#ff9900', icon: 'cloud' },
	SVN: { brand: '#809cc9' },
	'Visual SourceSafe': { brand: '#68217a' },
	FTP: { brand: '#888888' },
	Pulumi: { brand: '#8a3391', icon: 'pulumi' },
	k3s: { brand: '#ffc61c', icon: 'k3s' },

	// AI / LLM
	'Claude Code': { brand: '#d97706', icon: 'ai' },
	MCP: { brand: '#d97706', icon: 'ai' },
	OpenClaw: { brand: '#888888' },
	Copilot: { brand: '#6cc644' },
	ChatGPT: { brand: '#74aa9c', icon: 'ai' },
	'ChatGPT API': { brand: '#74aa9c', icon: 'ai' },
};

export function techVisual(name: string): TechVisual {
	return TECH_REGISTRY[name] ?? { brand: '#888888' };
}
