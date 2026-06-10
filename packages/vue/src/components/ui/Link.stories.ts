import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Link from './Link.vue';

// Text-first link, rendered in Vue's accent. `inline` for prose; `arrow` for the read-more affordance.
type Args = { variant: 'inline' | 'arrow'; label: string };

const meta: Meta<Args> = {
	title: 'Vue/Foundations/Link',
	component: Link,
	parameters: { layout: 'centered' },
	argTypes: {
		variant: { control: 'inline-radio', options: ['inline', 'arrow'] },
	},
	args: { variant: 'inline', label: 'Read the article' },
	render: (args) => ({
		components: { Link },
		setup: () => ({ args }),
		template: '<Link v-bind="args" to="/blog">{{ args.label }}</Link>',
	}),
};

export default meta;
type Story = StoryObj<Args>;

export const Inline: Story = {};

export const Arrow: Story = { args: { variant: 'arrow', label: 'See the full timeline' } };
