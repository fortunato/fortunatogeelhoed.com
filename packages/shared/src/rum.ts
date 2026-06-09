// Frontend real-user-monitoring (Grafana Faro), wired for privacy first.
//
//   - Sessionless: no session identifier is generated or stored, so nothing lands in the
//     browser that would trigger a consent banner (see repo/docs/frontend-telemetry.md).
//   - Minimal: errors and Web Vitals only — no console, session, or view instrumentation.
//   - First-party: events post to our own /api/rum proxy, never to Grafana directly, so the
//     collector key stays server-side and the visitor IP is stripped there.
//   - Best-effort: Faro is dynamically imported (kept out of the critical bundle) and any
//     failure is swallowed. RUM must never affect the page it measures.
//
// This module is intentionally not re-exported from the package barrel, so the dynamic import
// below stays a separate chunk and Faro never reaches the server/prerender build.

let started = false;

async function initRum(appName: string): Promise<void> {
	try {
		const { initializeFaro, ErrorsInstrumentation, WebVitalsInstrumentation } = await import(
			'@grafana/faro-web-sdk'
		);
		initializeFaro({
			url: '/api/rum',
			// One Faro application for the whole site; the framework is a namespace so the three
			// variants are distinguishable in Grafana while sharing one app and collector. Sourcemap
			// de-obfuscation keys on the per-build bundle id (injected by the build), not the name.
			app: { name: 'fortunatogeelhoed.com', namespace: appName, version: '1' },
			sessionTracking: { enabled: false },
			instrumentations: [new ErrorsInstrumentation(), new WebVitalsInstrumentation()],
		});
	} catch {
		// RUM is best-effort; never let a failure here affect the page.
	}
}

// Schedule RUM init off the critical path: after load, when the browser is idle, so it cannot
// compete with the page's own Web Vitals. Skips server/prerender and honours Do Not Track /
// Global Privacy Control by opting out entirely.
export function startRum(appName: string): void {
	if (started || typeof window === 'undefined') return;

	const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
	const legacyDnt = (window as unknown as { doNotTrack?: string }).doNotTrack;
	if (navigator.doNotTrack === '1' || legacyDnt === '1' || nav.globalPrivacyControl === true) {
		return;
	}

	started = true;
	const run = () => void initRum(appName);
	const schedule = () =>
		'requestIdleCallback' in window
			? (window as Window & typeof globalThis).requestIdleCallback(run)
			: setTimeout(run, 1000);

	if (document.readyState === 'complete') schedule();
	else window.addEventListener('load', schedule, { once: true });
}
