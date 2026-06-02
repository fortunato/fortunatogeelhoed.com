import { useContent } from '../content';

export function Blog() {
	const content = useContent('blog');

	return (
		<section>
			<div className="container">
				<span className="section-label">Writing</span>
				<h2 className="section-title">{content?.title ?? 'Blog'}</h2>
				<p style={{ color: 'var(--text-secondary)' }}>
					{content?.body ?? 'Blog posts will be loaded from the content pipeline.'}
				</p>
			</div>
		</section>
	);
}
