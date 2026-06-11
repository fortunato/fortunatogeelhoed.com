import type { Framework } from './middleware/framework';

export type Theme = 'dark' | 'light';

// Escape text that is interpolated into markup. `bodyHtml` is deliberately raw framework output,
// but `title`/`description` are plain text: escaping them keeps this reusable shell from becoming
// an injection sink the moment a caller passes a content-derived string. Covers the attribute
// context (description) too, so `"` is escaped alongside `& < >`.
function escapeText(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

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
	"(() => { try { const m = document.cookie.match(/(?:^|;\\s*)theme=(dark|light)/); let t = m ? m[1] : localStorage.getItem('theme'); if (t !== 'dark' && t !== 'light') t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', t); } catch (e) {} try { if (sessionStorage.getItem('jb-reassemble')) { const r = document.documentElement; r.style.opacity = '0'; r.setAttribute('data-switched', ''); setTimeout(() => { r.style.opacity = ''; }, 3000); } } catch (e) {} })();";

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
	<title>${title ? escapeText(title) : 'FORTUNATO.GEELHOED — Senior Full-Stack Engineer'}</title>
	${description ? `<meta name="description" content="${escapeText(description)}">` : ''}
	<link rel="icon" href="/favicon.ico" sizes="any">
	<link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
	<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
	<link rel="manifest" href="/assets/icons/site.webmanifest">
	<meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)">
	<meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)">
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
