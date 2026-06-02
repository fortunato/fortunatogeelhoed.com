import { useContent } from '../content';

export function Services() {
	const content = useContent('services');

	return (
		<section>
			<div className="container">
				<span className="section-label">What I Do</span>
				<h2 className="section-title">{content?.title ?? 'Services'}</h2>
				<p style={{ color: 'var(--jb-text-secondary)' }}>
					{content?.body ??
						'Services page content will be loaded from the content pipeline.'}
				</p>
			</div>
		</section>
	);
}
