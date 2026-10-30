import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentPageComponent } from '../components/content-page.component';
import { ContentService } from '../content.service';

@Component({
	selector: 'app-services',
	standalone: true,
	imports: [ContentPageComponent],
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `<app-content-page label="Services" [content]="content" />`,
})
export class ServicesComponent {
	protected readonly content = inject(ContentService).getContent('services');
}
