import type { WritingTeaserItem } from '@fg/shared';
import styles from '@styles/components/home.module.css';
import { Link } from 'react-router';

export function LatestWriting({ writing }: { writing: WritingTeaserItem[] }) {
	return (
		<section>
			<div className="container">
				<p className="section-label">Latest writing</p>
				<h2 className="section-title">From the blog</h2>
				<div className={styles['writing-grid']}>
					{writing.map((post) => (
						<Link
							key={post.title}
							to={post.href}
							className={`card ${styles['writing-card']}`}
							data-reveal
						>
							<h3 className={styles['writing-title']}>{post.title}</h3>
							<p className={styles['writing-blurb']}>{post.blurb}</p>
							<span className={styles['writing-more']}>Read more →</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
