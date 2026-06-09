import faroUploader from '@grafana/faro-rollup-plugin';
import type { PluginOption } from 'vite';

// Build-time half of the Grafana Faro sourcemap pipeline. Each framework build injects a per-build
// bundle id into its chunks (so runtime errors carry it) and emits hidden sourcemaps for that build.
// It deliberately does NOT upload: `skipUpload` defers publishing to a separate release step, so the
// build stays free of secrets and network. The matching upload lives in .github/workflows/deploy.yml.
//
// Active only when FARO_BUNDLE_VERSION is set (the release image build sets it), so local, dev and
// test builds are untouched. The bundle id is the de-obfuscation key; the app name is shared across
// the three frameworks (see packages/shared/src/rum.ts) and must equal `appName` here.

const APP_NAME = 'fortunatogeelhoed.com';
const APP_ID = '6056';
const STACK_ID = '1681452';

// Sourcemap emission is gated on the same condition as the plugin, so a plain build (no version) and
// server passes stay map-free; only release client builds emit the hidden maps the upload needs.
export function faroSourcemapMode(isSsrBuild = false): 'hidden' | false {
	return !isSsrBuild && process.env.FARO_BUNDLE_VERSION ? 'hidden' : false;
}

// `isSsrBuild` skips server/SSG passes: those bundles never run in a browser, so their maps are noise.
export function faroSourcemaps(framework: string, isSsrBuild = false): PluginOption[] {
	const version = process.env.FARO_BUNDLE_VERSION;
	if (!version || isSsrBuild) return [];

	return [
		faroUploader({
			appName: APP_NAME,
			appId: APP_ID,
			stackId: STACK_ID,
			endpoint: process.env.FARO_SOURCEMAP_ENDPOINT ?? '',
			bundleId: `${framework}-${version}`,
			// Required by the option type but unused: uploading happens later in CI, not here.
			apiKey: '',
			skipUpload: true,
			// Without this the plugin removes the .map files after the (skipped) upload, leaving the
			// build step with nothing to hand to the publish step.
			keepSourcemaps: true,
			gzipContents: true,
		}),
	];
}
