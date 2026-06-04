import { registerElements } from '@fg/shared/elements';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Header } from './Header';

// Example React component test, in a real browser. The Header consumes the shared
// jb-theme-toggle custom element and the framework switcher, so it exercises the
// React ↔ web-component boundary. Use this as the pattern for future React components.
beforeAll(() => registerElements());
afterEach(cleanup);

describe('Header (React)', () => {
	it('renders the primary navigation links', () => {
		render(
			<MemoryRouter>
				<Header />
			</MemoryRouter>,
		);
		for (const label of ['Services', 'Work', 'Blog', 'Contact']) {
			expect(screen.getByText(label).getAttribute('href')).toBe(`/${label.toLowerCase()}`);
		}
	});

	it('links each framework switch to its switch endpoint', () => {
		render(
			<MemoryRouter>
				<Header />
			</MemoryRouter>,
		);
		expect(screen.getByText('vue').getAttribute('href')).toBe('/__switch?to=vue');
		expect(screen.getByText('angular').getAttribute('href')).toBe('/__switch?to=angular');
	});

	it('embeds the shared theme-toggle custom element', () => {
		const { container } = render(
			<MemoryRouter>
				<Header />
			</MemoryRouter>,
		);
		expect(container.querySelector('jb-theme-toggle')).toBeTruthy();
	});
});
