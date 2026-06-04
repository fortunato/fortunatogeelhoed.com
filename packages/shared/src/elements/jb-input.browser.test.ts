import { beforeAll, describe, expect, it } from 'vitest';
import { registerElements } from './index';
import type { JbInput } from './jb-input';

// jb-input is a light-DOM, form-associated custom element. It only behaves correctly in a
// real browser (custom-element upgrade, ElementInternals, real input events), so this runs
// in the browser-shared project rather than a simulated DOM.
beforeAll(() => registerElements());

async function mount(attrs: Partial<JbInput> = {}): Promise<JbInput> {
	const el = document.createElement('jb-input') as JbInput;
	Object.assign(el, attrs);
	document.body.append(el);
	await el.updateComplete;
	return el;
}

describe('jb-input', () => {
	it('renders an inner input reflecting the value', async () => {
		const el = await mount({ name: 'email', value: 'ada@example.com' });
		const input = el.querySelector('input');
		expect(input).toBeTruthy();
		expect(input?.value).toBe('ada@example.com');
		el.remove();
	});

	it('associates the label with the control for accessibility', async () => {
		const el = await mount({ name: 'email', label: 'Email' });
		const label = el.querySelector('label');
		const input = el.querySelector('input');
		expect(label?.textContent?.trim()).toBe('Email');
		expect(label?.getAttribute('for')).toBe('jb-email');
		expect(input?.id).toBe('jb-email');
		el.remove();
	});

	it('updates its value from a native input event', async () => {
		const el = await mount({ name: 'email' });
		const input = el.querySelector('input');
		if (!input) throw new Error('no input');
		input.value = 'grace@example.com';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(el.value).toBe('grace@example.com');
		el.remove();
	});

	it('reflects the disabled state to the control', async () => {
		const el = await mount({ name: 'email', disabled: true });
		expect(el.querySelector('input')?.disabled).toBe(true);
		el.remove();
	});
});
