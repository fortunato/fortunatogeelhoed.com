import { availabilityBadge, availabilityBookedLine } from '@fg/shared';
import { ContactForm } from '../components/ContactForm';
import { useContent } from '../content';
import { useAvailability } from '../hooks/useAvailability';

export function Contact() {
	const content = useContent('contact');
	const availability = useAvailability();

	// When available, the page keeps its regular copy; when booked, the sub-line adapts to
	// acknowledge the booking while keeping the door open.
	const body = availability.available
		? (content?.body ?? 'Get in touch for consulting, freelance projects, or collaboration.')
		: availabilityBookedLine(availability);

	return (
		<section>
			<div className="container">
				<span
					className="section-label"
					data-availability-badge
					data-state={availability.available ? 'available' : 'booked'}
				>
					{availabilityBadge(availability)}
				</span>
				<h1 className="section-title">{content?.title ?? "Let's work together."}</h1>
				<p data-availability-line style={{ color: 'var(--jb-text-secondary)' }}>
					{body}
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
