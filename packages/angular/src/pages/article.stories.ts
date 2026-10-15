import type { Meta, StoryObj } from '@analogjs/storybook-angular';
import { applicationConfig } from '@analogjs/storybook-angular';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { ArticleComponent } from './article.component';

// A single article, authored as an Angular standalone component. A cross-framework visual-parity
// subject: the same rendered article must look identical across React, Vue and Angular. A stub
// ActivatedRoute pins a fixed slug so the story is deterministic.
const SLUG = 'too-react';

const activatedRouteStub = {
	snapshot: { paramMap: convertToParamMap({ slug: SLUG }) },
};

const meta: Meta<ArticleComponent> = {
	title: 'Angular/Article',
	component: ArticleComponent,
	parameters: { layout: 'fullscreen' },
	decorators: [
		applicationConfig({
			providers: [
				provideRouter([]),
				{ provide: ActivatedRoute, useValue: activatedRouteStub },
			],
		}),
	],
};

export default meta;
type Story = StoryObj<ArticleComponent>;

export const Default: Story = {};
