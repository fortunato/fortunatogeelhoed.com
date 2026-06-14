import postsData from '@fg/content-data/posts.json';
import { type Article, articlePath } from '@fg/shared';
import styles from '@styles/components/writing.module.css';
import { Link } from 'react-router';
import { useContent } from '../content';

const published = (postsData as { published: Article[] }).published;

// Render an ISO date (YYYY-MM-DD) as a long, readable form. Fixed locale and UTC so the
// prerendered output is deterministic and identical across the three framework builds.
function formatDate(iso: string | undefined): string {
	if (!iso) return '';
	const date = new Date(`${iso}T00:00:00Z`);
	return new Intl.DateTimeFormat('en-GB', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	}).format(date);
}

export function Writing() {
	const content = useContent('writing');

	return (
		<section>
			<div className="container">
				<span className="section-label">Writing</span>
				<h1 className="section-title">{content?.title ?? 'Writing'}</h1>
				{content?.description ? (
					<p style={{ color: 'var(--jb-text-secondary)', maxWidth: '62ch' }}>
						{content.description}
					</p>
				) : null}
				<ul className={styles['writing-grid']}>
					{published.map((post) => (
						<li key={post.slug}>
							<Link
								to={articlePath(post.slug)}
								className={styles['writing-card']}
								data-reveal
							>
								<span className={styles['writing-tag']}>{post.tag}</span>
								<h2 className={styles['writing-title']}>{post.title}</h2>
								<p className={styles['writing-blurb']}>{post.description}</p>
								<span className={styles['writing-meta']}>
									{formatDate(post.date)} · {post.readingMinutes} min read
								</span>
								<span className={styles['writing-more']}>Read more</span>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
