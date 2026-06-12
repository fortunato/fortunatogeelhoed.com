import postsData from '@fg/content-data/posts.json';
import { type Article as ArticleType, WRITING_BASE } from '@fg/shared';
import styles from '@styles/components/prose.module.css';
import { Link, useParams } from 'react-router';

const published = (postsData as { published: ArticleType[] }).published;

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

export function Article() {
	const { slug } = useParams();
	const article = published.find((post) => post.slug === slug);

	if (!article) {
		return (
			<section>
				<div className="container">
					<h1 className="section-title">Not found</h1>
					<p style={{ color: 'var(--jb-text-secondary)' }}>
						That article does not exist.
					</p>
					<Link to={WRITING_BASE} viewTransition className="link link--arrow">
						Back to writing
					</Link>
				</div>
			</section>
		);
	}

	return (
		<section>
			<div className="container">
				<p className="section-label">{article.tag}</p>
				<h1 className="section-title">{article.title}</h1>
				<p
					className="writing-tag"
					style={{ display: 'block', marginBottom: 'var(--jb-space-lg)' }}
				>
					{formatDate(article.date)} · {article.tag} · {article.readingMinutes} min read
				</p>

				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, build-rendered article HTML */}
				<div className={styles.prose} dangerouslySetInnerHTML={{ __html: article.html }} />

				<p style={{ marginTop: 'var(--jb-space-xl)' }}>
					<Link to={WRITING_BASE} viewTransition className="link link--arrow">
						Back to writing
					</Link>
				</p>
			</div>
		</section>
	);
}
