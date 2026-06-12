import { provideRouter } from '@angular/router';
import { registerElements } from '@fg/shared/elements';
import { render, screen } from '@testing-library/angular';
import { beforeAll, describe, expect, it } from 'vitest';
import { HeaderComponent } from './header.component';

// Example Angular component test, in a real browser via TestBed. Completes the cross-
// framework set (React/Vue/Angular) so the same Header behaviour is proven in each.
// Use this as the pattern for future Angular components.
beforeAll(() => registerElements());

async function renderHeader() {
	return render(HeaderComponent, { providers: [provideRouter([])] });
}

describe('HeaderComponent (Angular)', () => {
	it('renders the primary navigation links', async () => {
		await renderHeader();
		const destinations: [string, string][] = [
			['Home', '/'],
			['Career', '/career'],
			['Writing', '/writing'],
			['Contact', '/contact'],
		];
		for (const [label, path] of destinations) {
			expect(screen.getByText(label).getAttribute('href')).toBe(path);
		}
	});

	it('links each framework switch to its switch endpoint', async () => {
		await renderHeader();
		expect(screen.getByText('react').getAttribute('href')).toBe('/__switch?to=react');
		expect(screen.getByText('vue').getAttribute('href')).toBe('/__switch?to=vue');
	});

	it('embeds the shared theme-toggle custom element', async () => {
		const { container } = await renderHeader();
		expect(container.querySelector('jb-theme-toggle')).toBeTruthy();
	});
});
