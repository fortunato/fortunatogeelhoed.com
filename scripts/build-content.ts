import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getPage } from '@fg/content';
import { routes } from '@fg/shared';
import type { ContentItem } from '@fg/shared';

const outFile = resolve(import.meta.dirname, '../packages/content/data.json');

const contentMap: Record<string, ContentItem> = {};

for (const route of routes) {
	if (route.contentSlug) {
		const item = await getPage(route.contentSlug);
		if (item) contentMap[route.contentSlug] = item;
	}
}

await writeFile(outFile, JSON.stringify(contentMap, null, '\t'));
console.log(`✓ Built content data (${Object.keys(contentMap).length} pages)`);
