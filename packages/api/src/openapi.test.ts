import type { OpenAPIV3_1 } from 'openapi-types';
import { describe, expect, it } from 'vitest';
import { app } from './index';

// Drives the real, fully-wired app through app.request so the generated document reflects the
// routes the server actually serves — not a re-declared copy that could drift from them.

async function fetchSpec(): Promise<OpenAPIV3_1.Document> {
	const res = await app.request('/api/openapi.json');
	expect(res.status).toBe(200);
	return (await res.json()) as OpenAPIV3_1.Document;
}

// A media-type schema may be inlined or registered under components and referenced; resolve a
// $ref so assertions hold regardless of which form the generator chose.
function resolveSchema(
	doc: OpenAPIV3_1.Document,
	media: OpenAPIV3_1.MediaTypeObject | undefined,
): OpenAPIV3_1.SchemaObject {
	const schema = media?.schema;
	if (schema && '$ref' in schema) {
		const name = schema.$ref.split('/').pop() as string;
		return doc.components?.schemas?.[name] as OpenAPIV3_1.SchemaObject;
	}
	return schema as OpenAPIV3_1.SchemaObject;
}

describe('OpenAPI document', () => {
	it('is a valid 3.1 spec covering only the JSON API routes', async () => {
		const doc = await fetchSpec();
		expect(doc.openapi).toBe('3.1.0');
		expect(doc.info.title).toBe('fortunatogeelhoed.com API');
		// The self-describing endpoints and crawler files must not document themselves.
		expect(Object.keys(doc.paths ?? {}).sort()).toEqual([
			'/api/availability',
			'/api/contact',
			'/api/rum',
		]);
	});

	it('documents the contact request body and both outcomes from the shared schema', async () => {
		const doc = await fetchSpec();
		const post = doc.paths?.['/api/contact']?.post as OpenAPIV3_1.OperationObject;
		const requestBody = post.requestBody as OpenAPIV3_1.RequestBodyObject;
		const body = resolveSchema(doc, requestBody.content['application/json']);
		expect(body.required).toEqual(expect.arrayContaining(['name', 'email', 'message']));
		const props = body.properties as Record<string, OpenAPIV3_1.SchemaObject>;
		expect(props.email?.format).toBe('email');
		// 200/422 are the handler's own outcomes; 403/413/429 come from the CSRF, body-limit and
		// rate-limit guards in front of it — documented so the spec stays truthful to what callers
		// can see.
		expect(Object.keys(post.responses ?? {}).sort()).toEqual([
			'200',
			'403',
			'413',
			'422',
			'429',
		]);
	});

	it('derives the availability response from the shared availability schema', async () => {
		const doc = await fetchSpec();
		const get = doc.paths?.['/api/availability']?.get as OpenAPIV3_1.OperationObject;
		const ok = get.responses?.['200'] as OpenAPIV3_1.ResponseObject;
		const schema = resolveSchema(doc, ok.content?.['application/json']);
		expect(Object.keys(schema.properties ?? {}).sort()).toEqual(['available', 'until']);
	});

	it('documents the telemetry proxy as an empty 204', async () => {
		const doc = await fetchSpec();
		const post = doc.paths?.['/api/rum']?.post as OpenAPIV3_1.OperationObject;
		expect(Object.keys(post.responses ?? {}).sort()).toEqual(['204', '403', '413', '429']);
		const noContent = post.responses?.['204'] as OpenAPIV3_1.ResponseObject;
		expect(noContent.content).toBeUndefined();
	});

	it('serves an interactive reference that reads the live spec', async () => {
		const res = await app.request('/api/docs');
		expect(res.status).toBe(200);
		expect(res.headers.get('content-type')).toContain('text/html');
		expect(await res.text()).toContain('/api/openapi.json');
	});

	it('leaves contact validation behaviour unchanged', async () => {
		// Documenting the route must not alter how it rejects a malformed payload: the original
		// 422 with field-keyed errors still stands.
		const res = await app.request('/api/contact', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({}),
		});
		expect(res.status).toBe(422);
		const data = (await res.json()) as { errors: Record<string, string[]> };
		expect(Object.keys(data.errors).length).toBeGreaterThan(0);
	});
});
