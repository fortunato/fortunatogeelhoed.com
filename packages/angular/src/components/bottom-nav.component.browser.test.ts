import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerElements } from '@fg/shared/elements';
import { render, screen } from '@testing-library/angular';
import { beforeAll, describe, expect, it } from 'vitest';
import { BottomNavComponent } from './bottom-nav.component';

// The mobile-first primary navigation, in a real browser. Mirrors the React/Vue tests so
// the same nav behaviour (destinations + active state) is proven across all three.
beforeAll(() => registerElements());

@Component({ standalone: true, template: '' })
class BlankComponent {}

const ROUTES = [
	{ path: '', component: BlankComponent },
	{ path: 'career', component: BlankComponent },
	{ path: 'contact', component: BlankComponent },
];

const DESTINATIONS: [string, string][] = [
	['Home', '/'],
	['Career', '/career'],
	['Contact', '/contact'],
];

describe('BottomNavComponent (Angular)', () => {
	it('exposes the three primary destinations', async () => {
		await render(BottomNavComponent, { providers: [provideRouter(ROUTES)] });
		for (const [label, path] of DESTINATIONS) {
			expect(screen.getByRole('link', { name: label }).getAttribute('href')).toBe(path);
		}
	});

	it('marks the current destination as active', async () => {
		const { navigate } = await render(BottomNavComponent, {
			providers: [provideRouter(ROUTES)],
		});
		await navigate('/career');
		expect(screen.getByRole('link', { name: 'Career' }).getAttribute('aria-current')).toBe(
			'page',
		);
		expect(screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBeNull();
	});
});
