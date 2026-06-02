import type { Framework } from './middleware/framework';

interface ShellOptions {
	framework: Framework;
	title?: string;
	description?: string;
	bodyHtml?: string;
	stylesheetPath?: string;
}

export function renderShell({
	framework,
	title,
	description,
	bodyHtml = '',
	stylesheetPath = '/assets/styles.css',
}: ShellOptions): string {
	const noindex = framework !== 'react' ? '<meta name="robots" content="noindex">' : '';

	return `<!DOCTYPE html>
<html lang="en" data-theme="dark" data-framework="${framework}">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	${noindex}
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
