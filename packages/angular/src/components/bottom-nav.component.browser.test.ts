import { Component } from '@angular/core';
import { type Route, provideRouter } from '@angular/router';
import { NAV_ITEMS } from '@fg/shared';
import { registerElements } from '@fg/shared/elements';
import { render, screen } from '@testing-library/angular';
import { beforeAll, describe, expect, it } from 'vitest';
import { BottomNavComponent } from './bottom-nav.component';

// The mobile-first primary navigation, in a real browser. Mirrors the React/Vue tests so
// the same nav behaviour (destinations + active state) is proven across all three.
beforeAll(() => registerElements());

@Component({ standalone: true, template: '' })
class BlankComponent {}

const ROUTES: Route[] = NAV_ITEMS.map((item) => ({
	path: item.path === '/' ? '' : item.path.replace(/^\//, ''),
	component: BlankComponent,
}));

describe('BottomNavComponent (Angular)', () => {
	it('exposes every primary destination', async () => {
		await render(BottomNavComponent, { providers: [provideRouter(ROUTES)] });
		for (const item of NAV_ITEMS) {
			expect(screen.getByRole('link', { name: item.label }).getAttribute('href')).toBe(
				item.path,
			);
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
