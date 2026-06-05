import { Component, input } from '@angular/core';
import type { ProofPoint } from '@fg/shared';

@Component({
	selector: 'app-proof-strip',
	standalone: true,
	styleUrl: '../../../../../styles/components/proof.module.css',
	template: `
		<section class="proof">
			<div class="container">
				<p class="section-label">Proof</p>
				<div class="proof-grid">
					@for (point of proof(); track point.label) {
						<div data-reveal>
							<p class="proof-metric">{{ point.metric }}</p>
							<p class="proof-label">{{ point.label }}</p>
						</div>
					}
				</div>
			</div>
		</section>
	`,
})
export class ProofStripComponent {
	readonly proof = input.required<ProofPoint[]>();
}
