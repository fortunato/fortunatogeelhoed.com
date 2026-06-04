import { useContent } from '../content';

export function Blog() {
	const content = useContent('blog');

	return (
		<section>
			<div className="container">
				<span className="section-label">Writing</span>
				<h1 className="section-title">{content?.title ?? 'Blog'}</h1>
				<p style={{ color: 'var(--jb-text-secondary)' }}>
					{content?.body ?? 'Blog posts will be loaded from the content pipeline.'}
				</p>
			</div>
		</section>
	);
}
