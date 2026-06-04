import { beforeAll, describe, expect, it } from 'vitest';
import { registerElements } from './index';
import type { JbTextarea } from './jb-textarea';

beforeAll(() => registerElements());

async function mount(attrs: Partial<JbTextarea> = {}): Promise<JbTextarea> {
	const el = document.createElement('jb-textarea') as JbTextarea;
	Object.assign(el, attrs);
	document.body.append(el);
	await el.updateComplete;
	return el;
}

describe('jb-textarea', () => {
	it('renders an inner textarea reflecting the value and rows', async () => {
		const el = await mount({ name: 'message', value: 'Hello', rows: 6 });
		const textarea = el.querySelector('textarea');
		expect(textarea?.value).toBe('Hello');
		expect(textarea?.rows).toBe(6);
		el.remove();
	});

	it('associates the label with the control', async () => {
		const el = await mount({ name: 'message', label: 'Message' });
		expect(el.querySelector('label')?.getAttribute('for')).toBe('jb-message');
		expect(el.querySelector('textarea')?.id).toBe('jb-message');
		el.remove();
	});

	it('updates its value from a native input event', async () => {
		const el = await mount({ name: 'message' });
		const textarea = el.querySelector('textarea');
		if (!textarea) throw new Error('no textarea');
		textarea.value = 'Updated body';
		textarea.dispatchEvent(new Event('input', { bubbles: true }));
		expect(el.value).toBe('Updated body');
		el.remove();
	});
});
