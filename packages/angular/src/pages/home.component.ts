import { Component } from '@angular/core';
import homeData from '@fg/content-data/home.json';
import type { HomeContent } from '@fg/shared';
import { CallToActionComponent } from '../components/home/call-to-action.component';
import { FrameworkExposureComponent } from '../components/home/framework-exposure.component';
import { HeroComponent } from '../components/home/hero.component';
import { LatestWritingComponent } from '../components/home/latest-writing.component';
import { ProofStripComponent } from '../components/home/proof-strip.component';
import { ServicesComponent } from '../components/home/services.component';

const home = homeData as HomeContent;

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [
		HeroComponent,
		ServicesComponent,
		FrameworkExposureComponent,
		ProofStripComponent,
		LatestWritingComponent,
		CallToActionComponent,
	],
	template: `
		<app-hero [hero]="home.hero" />
		<app-services [services]="home.services" />
		<app-framework-exposure />
		<app-proof-strip [proof]="home.proof" />
		<app-latest-writing [writing]="home.writing" />
		<app-call-to-action [cta]="home.cta" />
	`,
})
export class HomeComponent {
	protected readonly home = home;
}
