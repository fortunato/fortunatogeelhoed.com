import { NAV_ITEMS } from '@fg/shared';
import { registerElements } from '@fg/shared/elements';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { BottomNav } from './BottomNav';

// The mobile-first primary navigation, in a real browser. Mirrors the Vue/Angular tests so
// the same nav behaviour (destinations + active state) is proven across all three.
beforeAll(() => registerElements());
afterEach(cleanup);

describe('BottomNav (React)', () => {
	it('exposes every primary destination', () => {
		render(
			<MemoryRouter>
				<BottomNav />
			</MemoryRouter>,
		);
		for (const item of NAV_ITEMS) {
			expect(screen.getByRole('link', { name: item.label }).getAttribute('href')).toBe(
				item.path,
			);
		}
	});

	it('marks the current destination as active', () => {
		render(
			<MemoryRouter initialEntries={['/career']}>
				<BottomNav />
			</MemoryRouter>,
		);
		expect(screen.getByRole('link', { name: 'Career' }).getAttribute('aria-current')).toBe(
			'page',
		);
		expect(screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBeNull();
	});
});
