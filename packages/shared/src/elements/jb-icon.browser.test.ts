import { beforeAll, describe, expect, it } from 'vitest';
import { registerElements } from './index';
import type { JbIcon } from './jb-icon';

// jb-icon is a light-DOM custom element that inlines an SVG glyph keyed by `name`. It renders
// in a real browser (custom-element upgrade, light-DOM render root) so this runs in the
// browser-shared project rather than a simulated DOM.
beforeAll(() => registerElements());

async function mount(name: string): Promise<JbIcon> {
	const el = document.createElement('jb-icon') as JbIcon;
	el.name = name;
	document.body.append(el);
	await el.updateComplete;
	return el;
}

describe('jb-icon', () => {
	it('renders into light DOM (no shadow root) so it inherits currentColor', async () => {
		const el = await mount('github');
		expect(el.shadowRoot).toBeNull();
		expect(el.querySelector('svg')).toBeTruthy();
		el.remove();
	});

	it('inlines the glyph path for a known name', async () => {
		const el = await mount('github');
		const path = el.querySelector('svg path');
		expect(path).toBeTruthy();
		expect(path?.getAttribute('d')?.length).toBeGreaterThan(0);
		el.remove();
	});

	it('is decorative by default (aria-hidden, currentColor fill)', async () => {
		const el = await mount('home');
		const svg = el.querySelector('svg');
		expect(svg?.getAttribute('aria-hidden')).toBe('true');
		expect(svg?.getAttribute('fill')).toBe('currentColor');
		expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
		el.remove();
	});

	it('renders nothing for an unknown name', async () => {
		const el = await mount('not-a-real-glyph');
		expect(el.querySelector('svg')).toBeNull();
		el.remove();
	});

	it('renders nothing when no name is set', async () => {
		const el = document.createElement('jb-icon') as JbIcon;
		document.body.append(el);
		await el.updateComplete;
		expect(el.querySelector('svg')).toBeNull();
		el.remove();
	});

	it('swaps the glyph when the name changes', async () => {
		const el = await mount('github');
		const first = el.querySelector('svg path')?.getAttribute('d');
		el.name = 'linkedin';
		await el.updateComplete;
		const second = el.querySelector('svg path')?.getAttribute('d');
		expect(second).toBeTruthy();
		expect(second).not.toBe(first);
		el.remove();
	});
});
