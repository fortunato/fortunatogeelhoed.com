import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { registerElements } from '@fg/shared/elements';
import { render } from '@testing-library/angular';
import { beforeAll, describe, expect, it } from 'vitest';
import { JbControlValueAccessor } from './jb-input.value-accessor';

// The ControlValueAccessor that bridges the shared <jb-input>/<jb-textarea> custom elements into
// Angular forms. Verified in a real browser so the elements upgrade: writeValue sets the host
// `value` property, a bubbling native `input` event flows back into the control, blur marks it
// touched, and the disabled state is reflected onto the element.
beforeAll(() => registerElements());

@Component({
	standalone: true,
	imports: [ReactiveFormsModule, JbControlValueAccessor],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	template: `<jb-input name="email" label="Email" [formControl]="control"></jb-input>`,
})
class HostComponent {
	readonly control = new FormControl('');
}

interface JbHost extends HTMLElement {
	value: string;
	disabled: boolean;
}

function elements(): { host: JbHost; input: HTMLInputElement } {
	const host = document.querySelector('jb-input') as JbHost;
	const input = host.querySelector('input');
	if (!input) throw new Error('no inner input');
	return { host, input };
}

describe('JbControlValueAccessor (Angular)', () => {
	it('writes a control value onto the host element (writeValue)', async () => {
		const { fixture } = await render(HostComponent);
		const component = fixture.componentInstance;

		component.control.setValue('ada@example.com');
		fixture.detectChanges();
		await fixture.whenStable();

		const { host, input } = elements();
		expect(host.value).toBe('ada@example.com');
		expect(input.value).toBe('ada@example.com');
	});

	it('coerces a null control value to an empty string', async () => {
		const { fixture } = await render(HostComponent);
		fixture.componentInstance.control.setValue(null);
		fixture.detectChanges();
		await fixture.whenStable();

		expect(elements().host.value).toBe('');
	});

	it('flows a native bubbling input event back into the control', async () => {
		const { fixture } = await render(HostComponent);
		const { input } = elements();

		input.value = 'grace@example.com';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		fixture.detectChanges();

		expect(fixture.componentInstance.control.value).toBe('grace@example.com');
	});

	it('marks the control touched on blur', async () => {
		const { fixture } = await render(HostComponent);
		const { input } = elements();
		expect(fixture.componentInstance.control.touched).toBe(false);

		input.dispatchEvent(new Event('blur', { bubbles: true }));
		fixture.detectChanges();

		expect(fixture.componentInstance.control.touched).toBe(true);
	});

	it('reflects the control disabled state onto the host element (setDisabledState)', async () => {
		const { fixture } = await render(HostComponent);
		fixture.componentInstance.control.disable();
		fixture.detectChanges();
		await fixture.whenStable();

		expect(elements().host.disabled).toBe(true);
	});
});
