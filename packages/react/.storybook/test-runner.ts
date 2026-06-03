// Re-export the shared a11y + smoke test-runner config so it applies when the runner
// targets this section (test-storybook resolves test-runner.ts from the --config-dir).
export { default } from '../../../.storybook/test-runner';
