import { describe, expect, it } from 'vitest';
import { renderShell } from './shell';

describe('renderShell', () => {
	it('marks non-react variants noindex so they are not indexed as duplicate content', () => {
		expect(renderShell({ framework: 'vue' })).toContain(
			'<meta name="robots" content="noindex">',
		);
		expect(renderShell({ framework: 'angular' })).toContain(
			'<meta name="robots" content="noindex">',
		);
	});

	it('lets the react variant be indexed (no noindex)', () => {
		expect(renderShell({ framework: 'react' })).not.toContain('noindex');
	});

	it('reflects the framework and theme on the root element', () => {
		const html = renderShell({ framework: 'angular', theme: 'light' });
		expect(html).toContain('data-framework="angular"');
		expect(html).toContain('data-theme="light"');
	});

	it('defaults the theme to dark', () => {
		expect(renderShell({ framework: 'react' })).toContain('data-theme="dark"');
	});

	it('uses the default title when none is given, and the supplied one otherwise', () => {
		expect(renderShell({ framework: 'react' })).toContain(
			'<title>FORTUNATO.GEELHOED — Senior Full-Stack Engineer</title>',
		);
		expect(renderShell({ framework: 'react', title: 'Contact' })).toContain(
			'<title>Contact</title>',
		);
	});

	it('emits a description meta only when a description is supplied', () => {
		expect(renderShell({ framework: 'react' })).not.toContain('name="description"');
		expect(renderShell({ framework: 'react', description: 'Hire me' })).toContain(
			'<meta name="description" content="Hire me">',
		);
	});

	it('escapes title and description so text cannot break out of the markup', () => {
		const html = renderShell({
			framework: 'react',
			title: '</title><script>x</script>',
			description: 'a "quote" & <tag>',
		});
		expect(html).not.toContain('<script>x</script>');
		expect(html).toContain('&lt;script&gt;');
		// The description sits in an attribute, so its quotes must be neutralised too.
		expect(html).toContain('content="a &quot;quote&quot; &amp; &lt;tag&gt;"');
	});
});
