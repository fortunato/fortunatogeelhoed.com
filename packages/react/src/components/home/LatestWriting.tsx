import type { HomeContent, WritingTeaserItem } from '@fg/shared';
import styles from '@styles/components/writing.module.css';
import { Link } from 'react-router';

export function LatestWriting({
	writing,
	copy,
}: {
	writing: WritingTeaserItem[];
	copy: HomeContent['sections']['writing'];
}) {
	return (
		<section aria-labelledby="writing-title">
			<div className="container">
				<p className="section-label">{copy.label}</p>
				<h2 className="section-title" id="writing-title">
					{copy.title}
				</h2>
				<ul className={styles['writing-grid']}>
					{writing.map((post) => (
						<li key={post.title}>
							<Link
								to={post.href}
								className={styles['writing-card']}
								data-reveal
							>
								<span className={styles['writing-tag']}>{post.tag}</span>
								<h3 className={styles['writing-title']}>{post.title}</h3>
								<p className={styles['writing-blurb']}>{post.blurb}</p>
								<span className={styles['writing-more']}>{copy.readMore}</span>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
