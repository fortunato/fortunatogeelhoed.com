import { beforeAll, describe, expect, it } from 'vitest';
import { registerElements } from './index';
import type { JbTechTag } from './jb-tech-tag';

beforeAll(() => registerElements());

async function mount(label: string): Promise<JbTechTag> {
	const el = document.createElement('jb-tech-tag') as JbTechTag;
	el.textContent = label;
	document.body.append(el);
	await el.updateComplete;
	return el;
}

// jb-tech-tag is the one shadow-DOM element — it renders a <slot> inside a shadow root.
// This asserts the shadow boundary exists and the slotted label projects through, which a
// simulated DOM cannot model reliably.
describe('jb-tech-tag', () => {
	it('renders a shadow root with a slot for the label', async () => {
		const el = await mount('React');
		expect(el.shadowRoot).toBeTruthy();
		const slot = el.shadowRoot?.querySelector('slot');
		expect(slot).toBeTruthy();
		const assigned = (slot as HTMLSlotElement).assignedNodes();
		expect(assigned.map((n) => n.textContent).join('')).toBe('React');
		el.remove();
	});
});
