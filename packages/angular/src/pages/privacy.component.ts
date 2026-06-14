import { Component, inject } from '@angular/core';
import { ContentPageComponent } from '../components/content-page.component';
import { ContentService } from '../content.service';

@Component({
	selector: 'app-privacy',
	standalone: true,
	imports: [ContentPageComponent],
	template: `<app-content-page label="Privacy" [content]="content" />`,
})
export class PrivacyComponent {
	protected readonly content = inject(ContentService).getContent('privacy');
}
