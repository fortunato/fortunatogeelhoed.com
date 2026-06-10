import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from './components/bottom-nav.component';
import { FooterComponent } from './components/footer.component';
import { HeaderComponent } from './components/header.component';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, HeaderComponent, FooterComponent, BottomNavComponent],
	template:
		'<a class="skip-link" href="#main">Skip to content</a><app-header /><main id="main" tabindex="-1"><router-outlet /></main><app-footer /><app-bottom-nav />',
})
export class AppComponent {}
