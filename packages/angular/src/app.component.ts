import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer.component';
import { HeaderComponent } from './components/header.component';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, HeaderComponent, FooterComponent],
	template: '<app-header /><main><router-outlet /></main><app-footer />',
})
export class AppComponent {}
