import { toParagraphs } from '@fg/shared';
import { useContent } from '../content';

export function Services() {
	const content = useContent('services');
	const paragraphs = toParagraphs(content?.body ?? '');

	return (
		<section>
			<div className="container">
				<span className="section-label">What I Do</span>
				<h1 className="section-title">{content?.title ?? 'Services'}</h1>
				<div
					style={{
						maxWidth: '62ch',
						display: 'flex',
						flexDirection: 'column',
						gap: 'var(--jb-space-md)',
						color: 'var(--jb-text-secondary)',
						lineHeight: 1.7,
					}}
				>
					{paragraphs.map((paragraph) => (
						<p key={paragraph.slice(0, 32)}>{paragraph}</p>
					))}
				</div>
			</div>
		</section>
	);
}
