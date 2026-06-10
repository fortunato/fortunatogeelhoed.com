import { Component, input } from '@angular/core';
import type { HomeContent, ProofPoint } from '@fg/shared';

@Component({
	selector: 'app-proof-strip',
	standalone: true,
	styleUrl: '../../../../../styles/components/proof.module.css',
	template: `
		<section data-band [attr.aria-label]="copy().label">
			<div class="container proof-body">
				<p class="section-label">{{ copy().label }}</p>
				<dl class="proof-grid">
					@for (point of proof(); track point.label) {
						<div class="proof-item" data-reveal>
							<dt class="proof-label">{{ point.label }}</dt>
							<dd class="proof-metric">{{ point.metric }}</dd>
						</div>
					}
				</dl>
			</div>
		</section>
	`,
})
export class ProofStripComponent {
	readonly proof = input.required<ProofPoint[]>();
	readonly copy = input.required<HomeContent['sections']['proof']>();
}
