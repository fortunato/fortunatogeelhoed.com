import type { ContentItem } from '@fg/shared';
import styles from '@styles/components/prose.module.css';

// A long-form content page (Services, Privacy): a section label and title, then the page's
// build-rendered markdown HTML under the shared prose styles. The same component backs every
// such page so headings, lists, and in-content links render identically across the frameworks.
export function ContentPage({
	label,
	content,
}: {
	label: string;
	content: ContentItem | undefined;
}) {
	return (
		<section>
			<div className="container">
				<span className="section-label">{label}</span>
				<h1 className="section-title">{content?.title ?? ''}</h1>
				<div
					className={styles.prose}
					// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, build-rendered page HTML
					dangerouslySetInnerHTML={{ __html: content?.html ?? '' }}
				/>
			</div>
		</section>
	);
}
