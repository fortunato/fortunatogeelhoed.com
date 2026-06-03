import { LitElement, html } from 'lit';

// Form-associated multi-line input — a thin sibling of jb-input for the contact
// message field. Same single-channel ElementInternals pattern and light-DOM styling.
/**
 * @customElement jb-textarea
 * @fires input - Native input event, bubbling, as the value changes.
 * @fires blur - Bubbling blur event when the control loses focus.
 */
export class JbTextarea extends LitElement {
	static formAssociated = true;

	static properties = {
		name: { type: String },
		value: { type: String },
		placeholder: { type: String },
		label: { type: String },
		rows: { type: Number },
		required: { type: Boolean },
		disabled: { type: Boolean },
	};

	declare name: string;
	declare value: string;
	declare placeholder: string;
	declare label: string;
	declare rows: number;
	declare required: boolean;
	declare disabled: boolean;

	#internals: ElementInternals;

	constructor() {
		super();
		this.name = '';
		this.value = '';
		this.placeholder = '';
		this.label = '';
		this.rows = 4;
		this.required = false;
		this.disabled = false;
		this.#internals = this.attachInternals();
	}

	createRenderRoot() {
		return this;
	}

	get #textarea(): HTMLTextAreaElement | null {
		return this.querySelector('textarea');
	}

	render() {
		const id = this.name ? `jb-${this.name}` : undefined;
		return html`
			${this.label ? html`<label class="jb-field-label" for=${id}>${this.label}</label>` : null}
			<textarea
				class="jb-field-control"
				id=${id}
				.value=${this.value}
				placeholder=${this.placeholder}
				rows=${this.rows}
				?required=${this.required}
				?disabled=${this.disabled}
				@input=${(e: Event) => this.#onInput(e)}
				@blur=${() => this.#onBlur()}
			></textarea>
		`;
	}

	firstUpdated() {
		this.#internals.setFormValue(this.value);
		this.#syncValidity();
	}

	updated(changed: Map<string, unknown>) {
		if (changed.has('value')) {
			this.#internals.setFormValue(this.value);
			this.#syncValidity();
		}
	}

	#onInput(e: Event) {
		this.value = (e.target as HTMLTextAreaElement).value;
		this.#internals.setFormValue(this.value);
		this.#syncValidity();
	}

	#onBlur() {
		this.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
	}

	#syncValidity() {
		const el = this.#textarea;
		if (el) this.#internals.setValidity(el.validity, el.validationMessage, el);
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
