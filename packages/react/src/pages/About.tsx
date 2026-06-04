import { useContent } from '../content';

export function About() {
	const content = useContent('about');

	return (
		<section>
			<div className="container">
				<span className="section-label">About</span>
				<h1 className="section-title">{content?.title ?? 'Fortunato Geelhoed'}</h1>
				<p style={{ color: 'var(--jb-text-secondary)' }}>
					{content?.body ??
						'About page content will be loaded from the content pipeline.'}
				</p>
			</div>
		</section>
	);
}
