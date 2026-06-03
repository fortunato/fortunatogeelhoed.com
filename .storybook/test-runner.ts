import type { TestRunnerConfig } from '@storybook/test-runner';
import { checkA11y, injectAxe } from 'axe-playwright';

// Accessibility + smoke gate for the showcase. Runs every story in a headless browser
// (smoke) and fails on any critical/serious axe violation. Point it at one section
// at a time via TARGET_URL, e.g. `TARGET_URL=http://localhost:6007 bun run test:storybook`.
const config: TestRunnerConfig = {
	async preVisit(page) {
		await injectAxe(page);
	},
	async postVisit(page) {
		await checkA11y(page, '#storybook-root', {
			detailedReport: true,
			detailedReportOptions: { html: true },
			axeOptions: { runOnly: ['wcag2a', 'wcag2aa'] },
		});
	},
};

export default config;
