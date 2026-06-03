import { ContactForm } from '../components/ContactForm';
import { useContent } from '../content';

export function Contact() {
	const content = useContent('contact');

	return (
		<section>
			<div className="container">
				<span className="section-label">Available Now</span>
				<h2 className="section-title">{content?.title ?? "Let's work together."}</h2>
				<p style={{ color: 'var(--jb-text-secondary)' }}>
					{content?.body ??
						'Get in touch for consulting, freelance projects, or collaboration.'}
				</p>

				<ContactForm />

				<p className="contact-meta">
					<jb-tech-tag>React</jb-tech-tag>
					<jb-tech-tag>TypeScript</jb-tech-tag>
					<jb-tech-tag>Vite</jb-tech-tag>
				</p>
			</div>
		</section>
	);
}
