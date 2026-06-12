// Generate the branded 1200x630 social-preview images and write them to static/og. This produces
// the site-wide identity card (default.png) first, then one card per published article
// (<slug>.png). The build-content step picks these up and resolves each article's ogImage to
// /assets/og/<slug>.png when the file exists, falling back to default.png otherwise. The indexed
// pages point their og:image at default.png directly.
//
// This step is best-effort by design: any failure (missing or unparseable fonts, a rasteriser
// hiccup, no network for the fallback font) logs a warning and is skipped. It must never throw and
// never fail the build. A skipped article simply keeps the default social image.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import postsData from '@fg/content-data/posts.json';
import type { Article } from '@fg/shared';
import { SITE_NAME } from '@fg/shared';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import satori from 'satori';

const ogDir = resolve(import.meta.dirname, '../static/og');
const resvgWasmPath = resolve(
	import.meta.dirname,
	'../node_modules/@resvg/resvg-wasm/index_bg.wasm',
);

// Brand palette, mirrored from the dark-theme design tokens.
const BG = '#0a0a0a';
const FG = '#f0f0f0';
const MUTED = '#888888';
const ACCENT = '#bb5615';

// Satori needs an OpenType/TrueType/WOFF font it can parse; it cannot read the variable WOFF2 the
// site ships. Fetch single-weight WOFF cuts of the display typeface (Space Grotesk) at build time.
// If the network is unavailable the fetch fails and the whole step skips gracefully, falling back
// to the site's default social image.
const FONT_BASE =
	'https://cdn.jsdelivr.net/npm/@fontsource/space-grotesk@5.0.0/files/space-grotesk-latin';

interface FontData {
	name: string;
	data: ArrayBuffer;
	weight: 400 | 700;
	style: 'normal';
}

async function fetchFont(weight: 400 | 700): Promise<FontData> {
	const res = await fetch(`${FONT_BASE}-${weight}-normal.woff`);
	if (!res.ok) throw new Error(`font fetch failed (${weight}): ${res.status}`);
	return { name: 'Space Grotesk', data: await res.arrayBuffer(), weight, style: 'normal' };
}

async function loadFonts(): Promise<FontData[]> {
	return Promise.all([fetchFont(400), fetchFont(700)]);
}

// satori renders JSX-shaped objects, so cards are built as plain element trees (no React needed).
const child = (type: string, props: Record<string, unknown>, children?: unknown) => ({
	type,
	props: { ...props, children },
});

// Shared frame for every card: the dark branded background, padding, and column layout. The three
// slots (top eyebrow, primary block, footer) are filled differently per card so the article cards
// and the identity card read as one set.
function frame(slots: { eyebrow: unknown; primary: unknown; footer: unknown }) {
	return child(
		'div',
		{
			style: {
				width: '1200px',
				height: '630px',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: '72px',
				backgroundColor: BG,
				color: FG,
				fontFamily: 'Space Grotesk',
			},
		},
		[slots.eyebrow, slots.primary, slots.footer],
	);
}

function eyebrow(text: string) {
	return child(
		'div',
		{
			style: {
				display: 'flex',
				fontSize: '28px',
				fontWeight: 400,
				letterSpacing: '2px',
				textTransform: 'uppercase',
				color: ACCENT,
			},
		},
		text,
	);
}

function footer(text: string) {
	return child(
		'div',
		{ style: { display: 'flex', fontSize: '30px', fontWeight: 400, color: MUTED } },
		text,
	);
}

// Per-article card: eyebrow tag, the article title in the primary slot, the site name in the
// footer.
function articleCard(article: Article) {
	return frame({
		eyebrow: eyebrow(article.tag),
		primary: child(
			'div',
			{ style: { display: 'flex', fontSize: '72px', fontWeight: 700, lineHeight: 1.1 } },
			article.title,
		),
		footer: footer(SITE_NAME),
	});
}

// Identity card: the site-wide default. The name sits in the primary slot where an article title
// normally goes, with a role line and a muted one-liner stacked beneath it. Approved copy, kept
// verbatim here so the rendered card matches the rest of the site's voice.
function identityCard() {
	return frame({
		eyebrow: eyebrow('Portfolio'),
		primary: child(
			'div',
			{ style: { display: 'flex', flexDirection: 'column', gap: '20px' } },
			[
				child(
					'div',
					{
						style: {
							display: 'flex',
							fontSize: '80px',
							fontWeight: 700,
							lineHeight: 1.1,
						},
					},
					'Fortunato Geelhoed',
				),
				child(
					'div',
					{ style: { display: 'flex', fontSize: '38px', fontWeight: 400, color: FG } },
					'Full-Stack Engineer & Technical Lead',
				),
			],
		),
		footer: footer('I build, fix, and lead TypeScript platforms.'),
	});
}

// Rasterise a card element tree to a 1200x630 PNG buffer.
async function renderCard(tree: unknown, fonts: FontData[]): Promise<Uint8Array> {
	const svg = await satori(tree as Parameters<typeof satori>[0], {
		width: 1200,
		height: 630,
		fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style })),
	});
	return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}

async function buildOgImages() {
	const published = (postsData as { published: Article[] }).published;

	let fonts: FontData[];
	try {
		await initWasm(await readFile(resvgWasmPath));
		fonts = await loadFonts();
	} catch (err) {
		console.warn(
			`og-images: skipped (could not initialise renderer or fonts): ${(err as Error).message}`,
		);
		return;
	}

	await mkdir(ogDir, { recursive: true });

	// Generate the identity card first: it is the site-wide og:image and the per-article fallback,
	// so it matters most. On failure we deliberately leave any previously generated default.png in
	// place rather than deleting it, so a transient hiccup does not strip the site of its share
	// image. Tradeoff: a stale default.png can survive a copy change until the next successful run;
	// acceptable because the alternative (no card) is worse, and we do not fall back to a photo here.
	try {
		const png = await renderCard(identityCard(), fonts);
		await writeFile(resolve(ogDir, 'default.png'), png);
	} catch (err) {
		console.warn(
			`og-images: kept existing default.png, regeneration failed: ${(err as Error).message}`,
		);
	}

	let written = 0;
	for (const article of published) {
		try {
			const png = await renderCard(articleCard(article), fonts);
			await writeFile(resolve(ogDir, `${article.slug}.png`), png);
			written += 1;
		} catch (err) {
			console.warn(`og-images: skipped ${article.slug}: ${(err as Error).message}`);
		}
	}

	console.log(
		`✓ Generated default card + ${written}/${published.length} article images in static/og`,
	);
}

await buildOgImages();
