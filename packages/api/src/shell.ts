import type { Framework } from './middleware/framework';

export type Theme = 'dark' | 'light';

interface ShellOptions {
	framework: Framework;
	theme?: Theme;
	title?: string;
	description?: string;
	bodyHtml?: string;
	stylesheetPath?: string;
}

// Resolve theme before first paint (no FOUC): stored choice → system → dark.
const THEME_SCRIPT =
	"(() => { try { const m = document.cookie.match(/(?:^|;\\s*)theme=(dark|light)/); let t = m ? m[1] : localStorage.getItem('theme'); if (t !== 'dark' && t !== 'light') t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', t); } catch (e) {} })();";

export function renderShell({
	framework,
	theme = 'dark',
	title,
	description,
	bodyHtml = '',
	stylesheetPath = '/assets/styles.css',
}: ShellOptions): string {
	const noindex = framework !== 'react' ? '<meta name="robots" content="noindex">' : '';

	return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}" data-framework="${framework}">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	${noindex}
	<script>${THEME_SCRIPT}</script>
	<title>${title ?? 'FORTUNATO.GEELHOED — Senior Full-Stack Engineer'}</title>
	${description ? `<meta name="description" content="${description}">` : ''}
	<link rel="preload" href="/assets/fonts/rubik-variable.woff2" as="font" type="font/woff2" crossorigin>
	<link rel="preload" href="/assets/fonts/space-grotesk-variable.woff2" as="font" type="font/woff2" crossorigin>
	<link rel="preload" href="/assets/fonts/jetbrains-mono-variable.woff2" as="font" type="font/woff2" crossorigin>
	<link rel="stylesheet" href="${stylesheetPath}">
</head>
<body>
	<div id="app">${bodyHtml}</div>
</body>
</html>`;
}
