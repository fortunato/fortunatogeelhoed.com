import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LinkDirective } from './link.directive';

// Text-first link, rendered in Angular's accent. `inline` for prose; `arrow` for the read-more affordance.
type Args = { variant: 'inline' | 'arrow'; label: string };

const meta: Meta<Args> = {
	title: 'Angular/Foundations/Link',
	decorators: [moduleMetadata({ imports: [LinkDirective] })],
	parameters: { layout: 'centered' },
	argTypes: {
		variant: { control: 'inline-radio', options: ['inline', 'arrow'] },
	},
	args: { variant: 'inline', label: 'Read the article' },
	render: (args) => ({
		props: args,
		template: '<a jbLink [variant]="variant" href="#">{{ label }}</a>',
	}),
};

export default meta;
type Story = StoryObj<Args>;

export const Inline: Story = {};

export const Arrow: Story = { args: { variant: 'arrow', label: 'See the full timeline' } };
