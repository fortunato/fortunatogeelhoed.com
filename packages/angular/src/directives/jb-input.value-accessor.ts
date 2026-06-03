import { Directive, ElementRef, inject } from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

// Bridges the shared <jb-input>/<jb-textarea> web components into Angular's forms.
// Reactive Forms and ngModel talk to any element through a ControlValueAccessor; this
// one writes the control's `value` property and listens for the element's bubbling
// `input` event, so `formControlName`/`[(ngModel)]` work as if it were a native input.
@Directive({
	selector: 'jb-input, jb-textarea',
	standalone: true,
	providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: JbControlValueAccessor, multi: true }],
	host: {
		'(input)': 'onChange($event.target.value)',
		'(blur)': 'onTouched()',
	},
})
export class JbControlValueAccessor implements ControlValueAccessor {
	private el = inject<ElementRef<HTMLElement & { value: string; disabled: boolean }>>(ElementRef);

	onChange: (value: string) => void = () => {};
	onTouched: () => void = () => {};

	writeValue(value: string): void {
		this.el.nativeElement.value = value ?? '';
	}

	registerOnChange(fn: (value: string) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.el.nativeElement.disabled = isDisabled;
	}
}
