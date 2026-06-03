// Generates a Custom Elements Manifest for the shared jb-* web components.
// The web-components Storybook reads packages/shared/custom-elements.json to
// build property/attribute/event/slot tables and controls — there are no
// framework prop-types to introspect, so the manifest is the source of truth.
export default {
	globs: ['packages/shared/src/elements/*.ts'],
	exclude: ['packages/shared/src/elements/index.ts', '**/*.stories.ts'],
	outdir: 'packages/shared',
	litelement: true,
	dev: false,
};
