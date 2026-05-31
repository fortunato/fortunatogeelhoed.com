import { useContent } from '../content'

export function Contact() {
	const content = useContent('contact')

	return (
		<section>
			<div className="container">
				<span className="section-label">Available Now</span>
				<h2 className="section-title">{content?.title ?? "Let's work together."}</h2>
				<p style={{ color: 'var(--text-secondary)' }}>
					{content?.body ??
						'Get in touch for consulting, freelance projects, or collaboration.'}
				</p>
			</div>
		</section>
	)
}
