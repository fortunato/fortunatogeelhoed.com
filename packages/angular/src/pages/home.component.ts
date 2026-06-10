import { Component } from '@angular/core';
import homeData from '@fg/content-data/home.json';
import type { HomeContent } from '@fg/shared';
import { ApproachComponent } from '../components/home/approach.component';
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
		ApproachComponent,
		FrameworkExposureComponent,
		ProofStripComponent,
		LatestWritingComponent,
		CallToActionComponent,
	],
	template: `
		<app-hero [hero]="home.hero" />
		<app-services [services]="home.services" [copy]="home.sections.services" />
		<app-approach [principles]="home.principles" [copy]="home.sections.approach" />
		<app-framework-exposure [copy]="home.sections.frameworks" />
		<app-proof-strip [proof]="home.proof" [copy]="home.sections.proof" />
		<app-latest-writing [writing]="home.writing" [copy]="home.sections.writing" />
		<app-call-to-action [cta]="home.cta" />
	`,
})
export class HomeComponent {
	protected readonly home = home;
}
