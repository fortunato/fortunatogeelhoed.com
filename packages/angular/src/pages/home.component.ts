import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { HomeContent } from '@fg/shared';
import homeData from '../../../content/home.json';

const home = homeData as HomeContent;

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [RouterLink],
	styleUrl: '../../../../styles/components/home.module.css',
	template: `
		<section class="hero">
			<div class="hero-wallpaper" aria-hidden="true">
				@for (i of wallpaperLines; track i) {
					<div class="hero-wallpaper-line">{{ wallpaperLine }}</div>
				}
			</div>
			<div class="hero-content container">
				<p class="section-label">{{ home.hero.tagline }}</p>
				<h1 class="hero-name" data-reveal>{{ home.hero.name }}</h1>
				<p class="hero-statement" data-reveal>{{ home.hero.statement }}</p>
			</div>
		</section>

		<section>
			<div class="container">
				<p class="section-label">What I do</p>
				<h2 class="section-title">Services</h2>
				<div class="services-grid">
					@for (service of home.services; track service.title) {
						<article class="card" data-reveal>
							<h3 class="service-title">{{ service.title }}</h3>
							<p class="service-desc">{{ service.description }}</p>
						</article>
					}
				</div>
			</div>
		</section>

		<section class="proof">
			<div class="container">
				<p class="section-label">Proof</p>
				<div class="proof-grid">
					@for (point of home.proof; track point.label) {
						<div data-reveal>
							<p class="proof-metric">{{ point.metric }}</p>
							<p class="proof-label">{{ point.label }}</p>
						</div>
					}
				</div>
			</div>
		</section>

		<section>
			<div class="container">
				<p class="section-label">Latest writing</p>
				<h2 class="section-title">From the blog</h2>
				<div class="writing-grid">
					@for (post of home.writing; track post.title) {
						<a [routerLink]="post.href" class="card writing-card" data-reveal>
							<h3 class="writing-title">{{ post.title }}</h3>
							<p class="writing-blurb">{{ post.blurb }}</p>
							<span class="writing-more">Read more →</span>
						</a>
					}
				</div>
			</div>
		</section>

		<section class="cta">
			<div class="container">
				<h2 class="cta-heading" data-reveal>{{ home.cta.heading }}</h2>
				<a [routerLink]="home.cta.href" class="btn">Get in touch</a>
			</div>
		</section>
	`,
})
export class HomeComponent {
	protected readonly home = home;
	protected readonly wallpaperLine = 'FORTUNATO.GEELHOED  '.repeat(6);
	protected readonly wallpaperLines = Array.from({ length: 14 }, (_, i) => i);
}
