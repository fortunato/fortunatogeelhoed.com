import type { OpenAPIV3_1 } from 'openapi-types';
import { z } from 'zod';

// Shared spec-assembly utilities and document-level metadata for the code-first OpenAPI surface.
// Each route's description lives with its handler (contact.ts / availability.ts / rum.ts), built
// from the same Zod schemas the handlers and browser forms use, so the published spec can never
// drift from what the server accepts and returns. Only what the whole document needs in common
// stays here. The document is served live (see index.ts); fetch it from a running server to
// extract it.

// Convert a Zod schema to an inline OpenAPI 3.1 schema object, for request bodies — the library
// only accepts resolver() output in response positions. The cast bridges a pure type mismatch —
// JSON Schema spells `type` as a string, the OpenAPI types as an array — while the emitted value
// is valid OpenAPI 3.1. The redundant top-level dialect marker is dropped so the embedded schema
// matches the resolver-generated ones.
export function toOpenApiSchema(schema: z.ZodType): OpenAPIV3_1.SchemaObject {
	const { $schema: _dialect, ...rest } = z.toJSONSchema(schema);
	return rest as OpenAPIV3_1.SchemaObject;
}

// Top-level document metadata. The OpenAPI version and the assembled `paths` are filled in by
// the generator from the per-route descriptions; here we only supply what it can't infer.
export const apiDocumentation = {
	info: {
		title: 'fortunatogeelhoed.com API',
		version: '1.0.0',
		description:
			'First-party JSON API behind the portfolio: contact submissions, the live ' +
			'availability signal, and the privacy-preserving real-user-monitoring proxy.',
	},
	servers: [
		{ url: 'http://localhost:3000', description: 'Local development' },
		{ url: 'https://fortunatogeelhoed.com', description: 'Production' },
	],
};
