import { GITHUB_REPO_URL, LINKEDIN_URL, toParagraphs } from '@fg/shared';
import styles from '@styles/components/about.module.css';
import { Button } from '../components/ui/Button';
import { useContent } from '../content';

const PHOTO_ALT =
	'Fortunato Geelhoed, freelance full-stack TypeScript engineer based on the Costa Blanca, Spain';

export function About() {
	const content = useContent('about');
	const paragraphs = toParagraphs(content?.body ?? '');

	return (
		<section className={styles.about}>
			<article className={`${styles['about-inner']} container`}>
				<figure className={styles['about-photo']}>
					<img
						src="/assets/images/fortunato.webp"
						alt={PHOTO_ALT}
						width={480}
						height={600}
						decoding="async"
					/>
				</figure>
				<div className={styles['about-prose']}>
					<span className="section-label">About</span>
					<h1 className="section-title">Fortunato Geelhoed</h1>
					{paragraphs.map((paragraph, index) => (
						<p
							key={paragraph.slice(0, 32)}
							className={index === 0 ? styles['about-lead'] : undefined}
						>
							{paragraph}
						</p>
					))}
					<div className={styles['about-cta']}>
						<Button to="/career">View the career timeline</Button>
						<Button
							variant="secondary"
							href={GITHUB_REPO_URL}
							target="_blank"
							rel="noopener noreferrer"
							icon="github"
						>
							View the source
						</Button>
						<Button
							variant="secondary"
							href={LINKEDIN_URL}
							target="_blank"
							rel="noopener noreferrer"
							icon="linkedin"
						>
							LinkedIn
						</Button>
					</div>
				</div>
			</article>
		</section>
	);
}
