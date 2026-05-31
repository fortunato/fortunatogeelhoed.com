import { useContent } from '../content'

export function Work() {
	const content = useContent('work')

	return (
		<section>
			<div className="container">
				<span className="section-label">Selected Work</span>
				<h2 className="section-title">{content?.title ?? 'Case Studies'}</h2>
				<p style={{ color: 'var(--text-secondary)' }}>
					{content?.body ?? 'Work page content will be loaded from the content pipeline.'}
				</p>
			</div>
		</section>
	)
}
