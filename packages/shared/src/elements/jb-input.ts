import { LitElement, html, nothing } from 'lit';

// Form-associated text input, shared by all three framework variants.
//
// Light DOM (`createRenderRoot` returns `this`) so the global @layer stylesheet and
// `--jb-` tokens style the inner <input> directly — no shadow encapsulation to pierce.
//
// Form participation goes through a SINGLE channel: ElementInternals.setFormValue,
// keyed by the host's `name`. The inner <input> deliberately has NO `name`, so the
// value is never serialized twice. (Rendering a real named <input> server-side for a
// no-JS submit is a separate, later concern — registration here is browser-only.)
//
// Authored without decorators (`static properties` + `declare` + constructor assignment)
// to stay compatible with every toolchain in the monorepo, including Angular's compiler.
/**
 * Form-associated, light-DOM text input shared by every framework variant.
 *
 * @customElement jb-input
 * @fires input - Native input event, bubbling, as the value changes.
 * @fires blur - Bubbling blur event when the control loses focus.
 */
export class JbInput extends LitElement {
	static formAssociated = true;

	static properties = {
		name: { type: String },
		type: { type: String },
		value: { type: String },
		placeholder: { type: String },
		label: { type: String },
		autocomplete: { type: String },
		required: { type: Boolean },
		disabled: { type: Boolean },
		// Id of the external error message element to associate when in an error state. When set,
		// the inner control is marked aria-invalid and points at it via aria-describedby.
		errorId: { type: String, attribute: 'error-id' },
	};

	declare name: string;
	declare type: string;
	declare value: string;
	declare placeholder: string;
	declare label: string;
	declare autocomplete: string;
	declare required: boolean;
	declare disabled: boolean;
	declare errorId: string;

	#internals: ElementInternals;

	constructor() {
		super();
		this.name = '';
		this.type = 'text';
		this.value = '';
		this.placeholder = '';
		this.label = '';
		this.autocomplete = '';
		this.required = false;
		this.disabled = false;
		this.errorId = '';
		this.#internals = this.attachInternals();
	}

	createRenderRoot() {
		return this;
	}

	get #input(): HTMLInputElement | null {
		return this.querySelector('input');
	}

	render() {
		const id = this.name ? `jb-${this.name}` : undefined;
		return html`
			${this.label ? html`<label class="jb-field-label" for=${id}>${this.label}</label>` : null}
			<input
				class="jb-field-control"
				id=${id}
				.type=${this.type}
				.value=${this.value}
				placeholder=${this.placeholder}
				autocomplete=${this.autocomplete || 'on'}
				?required=${this.required}
				?disabled=${this.disabled}
				aria-invalid=${this.errorId ? 'true' : nothing}
				aria-describedby=${this.errorId || nothing}
				@input=${(e: Event) => this.#onInput(e)}
				@blur=${() => this.#onBlur()}
			/>
		`;
	}

	firstUpdated() {
		this.#internals.setFormValue(this.value);
		this.#syncValidity();
	}

	updated(changed: Map<string, unknown>) {
		// Keep the form value + validity in sync when `value` is set externally
		// (React controlled prop / Vue v-model / Angular writeValue).
		if (changed.has('value')) {
			this.#internals.setFormValue(this.value);
			this.#syncValidity();
		}
	}

	#onInput(e: Event) {
		this.value = (e.target as HTMLInputElement).value;
		this.#internals.setFormValue(this.value);
		this.#syncValidity();
		// The native `input` event already bubbles from the inner <input> through this
		// host, so React `onInput`, Vue `v-model`, and the Angular CVA all observe it
		// with `event.target.value` — no re-dispatch needed.
	}

	#onBlur() {
		this.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
	}

	#syncValidity() {
		const input = this.#input;
		if (input) this.#internals.setValidity(input.validity, input.validationMessage, input);
	}

	formResetCallback() {
		this.value = '';
	}

	formDisabledCallback(disabled: boolean) {
		this.disabled = disabled;
	}

	checkValidity(): boolean {
		return this.#internals.checkValidity();
	}

	reportValidity(): boolean {
		return this.#internals.reportValidity();
	}

	get validity(): ValidityState {
		return this.#internals.validity;
	}
}
