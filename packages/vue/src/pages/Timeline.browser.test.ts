import timelineData from '@fg/content-data/timeline.json';
import { type TimelineData, entryMatchesTech } from '@fg/shared';
import { cleanup, render, screen, waitFor } from '@testing-library/vue';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { useTechFilter } from '../composables/useTechFilter';
import Timeline from './Timeline.vue';

// Native click + waitFor for Vue's async updates: @testing-library/vue's fireEvent reads
// process.env, which is undefined under the browser test provider.
const click = (el: Element) => (el as HTMLElement).click();
const buttons = (name: string) => screen.getAllByRole('button', { name });
const firstButton = (name: string): HTMLElement => {
	const [el] = buttons(name);
	if (!el) throw new Error(`no button named "${name}"`);
	return el;
};

const data = timelineData as TimelineData;
const TOTAL = data.entries.length;
const matchCount = (active: Set<string>) =>
	data.entries.filter((e) => entryMatchesTech(e, active)).length;

const dimmedCount = () => document.querySelectorAll('article[data-dimmed="true"]').length;
const articleCount = () => document.querySelectorAll('article').length;
const urlTech = () => new URLSearchParams(window.location.search).get('tech');
const setUrlTech = (value?: string) =>
	window.history.replaceState(
		null,
		'',
		window.location.pathname + (value ? `?tech=${value}` : ''),
	);

async function renderTimeline() {
	const router = createRouter({
		history: createMemoryHistory(),
		// Catch-all stub so the page's nav/footer RouterLinks resolve without warnings.
		routes: [{ path: '/:rest(.*)*', component: { template: '<div />' } }],
	});
	router.push('/career');
	await router.isReady();
	render(Timeline, { global: { plugins: [router] } });
	await screen.findAllByRole('button', { name: 'Filter by React' });
}

beforeEach(() => {
	sessionStorage.clear();
	setUrlTech();
	useTechFilter().setActive([]); // reset the module-level singleton between tests
});
afterEach(() => {
	cleanup();
	sessionStorage.clear();
	setUrlTech();
});

describe('Timeline tech-pill filters (Vue)', () => {
	it('starts unfiltered: hint shown, nothing pressed or dimmed', async () => {
		await renderTimeline();
		expect(firstButton('Filter by React').getAttribute('aria-pressed')).toBe('false');
		expect(screen.queryByText('Filtering by')).toBeNull();
		expect(screen.getByText('Select any technology to filter the timeline')).toBeTruthy();
		expect(dimmedCount()).toBe(0);
	});

	it('toggling a pill presses every instance, dims non-matching rows, shows the bar', async () => {
		await renderTimeline();
		click(firstButton('Filter by React'));

		await waitFor(() => expect(dimmedCount()).toBeGreaterThan(0));
		for (const btn of buttons('Filter by React')) {
			expect(btn.getAttribute('aria-pressed')).toBe('true');
		}
		expect(screen.getByText('Filtering by')).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Remove React filter' })).toBeTruthy();
		expect(dimmedCount()).toBe(TOTAL - matchCount(new Set(['React'])));
		expect(dimmedCount()).toBeLessThan(articleCount());
		expect(
			screen.getByText(`${matchCount(new Set(['React']))} of ${TOTAL} roles match`),
		).toBeTruthy();
	});

	it('combines filters with AND (a second pill narrows the matches)', async () => {
		await renderTimeline();
		click(firstButton('Filter by React'));
		await waitFor(() => expect(dimmedCount()).toBeGreaterThan(0));
		const afterOne = dimmedCount();

		click(firstButton('Filter by Vue'));
		await waitFor(() =>
			expect(dimmedCount()).toBe(TOTAL - matchCount(new Set(['React', 'Vue']))),
		);
		expect(dimmedCount()).toBeGreaterThanOrEqual(afterOne);
	});

	it('Clear all resets pressed state, dimming and the bar', async () => {
		await renderTimeline();
		click(firstButton('Filter by React'));
		await waitFor(() => expect(dimmedCount()).toBeGreaterThan(0));

		click(screen.getByRole('button', { name: 'Clear all' }));
		await waitFor(() => expect(dimmedCount()).toBe(0));
		expect(screen.queryByText('Filtering by')).toBeNull();
	});

	it('mirrors the active filter into the URL via history (no navigation)', async () => {
		await renderTimeline();
		click(firstButton('Filter by React'));
		await waitFor(() => expect(urlTech()).toBe('react'));
	});

	it('seeds from the URL query after mount', async () => {
		setUrlTech('react');
		await renderTimeline();
		await waitFor(() =>
			expect(firstButton('Filter by React').getAttribute('aria-pressed')).toBe('true'),
		);
		expect(screen.getByText('Filtering by')).toBeTruthy();
	});

	it('seeds from sessionStorage when the URL has no query', async () => {
		sessionStorage.setItem('jb:timeline:tech', 'react');
		await renderTimeline();
		await waitFor(() =>
			expect(firstButton('Filter by React').getAttribute('aria-pressed')).toBe('true'),
		);
	});
});
