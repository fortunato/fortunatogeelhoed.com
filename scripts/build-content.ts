import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
	getBackendFrameworks,
	getFrontendFrameworks,
	getHomeContent,
	getPage,
	getTimeline,
	getTimelinePage,
} from '@fg/content';
import { routes } from '@fg/shared';
import type { ContentItem } from '@fg/shared';

const contentDir = resolve(import.meta.dirname, '../packages/content');

const contentMap: Record<string, ContentItem> = {};

for (const route of routes) {
	if (route.contentSlug) {
		const item = await getPage(route.contentSlug);
		if (item) contentMap[route.contentSlug] = item;
	}
}

await writeFile(resolve(contentDir, 'data.json'), `${JSON.stringify(contentMap, null, '\t')}\n`);
await writeFile(
	resolve(contentDir, 'home.json'),
	`${JSON.stringify(getHomeContent(), null, '\t')}\n`,
);
await writeFile(
	resolve(contentDir, 'timeline.json'),
	`${JSON.stringify(getTimeline(), null, '\t')}\n`,
);
await writeFile(
	resolve(contentDir, 'timeline-page.json'),
	`${JSON.stringify(getTimelinePage(), null, '\t')}\n`,
);
await writeFile(
	resolve(contentDir, 'frontend-frameworks.json'),
	`${JSON.stringify(getFrontendFrameworks(), null, '\t')}\n`,
);
await writeFile(
	resolve(contentDir, 'backend-frameworks.json'),
	`${JSON.stringify(getBackendFrameworks(), null, '\t')}\n`,
);
console.log(
	`✓ Built content data (${Object.keys(contentMap).length} pages, home, timeline, frameworks)`,
);
