import { Component, input } from '@angular/core';
import type { HomeContent } from '@fg/shared';

@Component({
	selector: 'app-hero',
	standalone: true,
	styleUrl: '../../../../../styles/components/home.module.css',
	template: `
		<section class="hero">
			<div class="hero-wallpaper" aria-hidden="true">
				@for (i of wallpaperLines; track i) {
					<div class="hero-wallpaper-line">{{ wallpaperLine }}</div>
				}
			</div>
			<div class="hero-content container">
				<p class="section-label" data-enter="1">{{ hero().tagline }}</p>
				<h1 class="hero-name" data-enter="2">{{ hero().name }}</h1>
				<p class="hero-statement" data-enter="3">{{ hero().statement }}</p>
			</div>
		</section>
	`,
})
export class HeroComponent {
	readonly hero = input.required<HomeContent['hero']>();
	protected readonly wallpaperLine = 'FORTUNATO.GEELHOED  '.repeat(6);
	protected readonly wallpaperLines = Array.from({ length: 14 }, (_, i) => i);
}
