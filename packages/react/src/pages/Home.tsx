export function Home() {
	return (
		<section className="hero">
			<div className="container">
				<h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 10vw, 8rem)', fontWeight: 800 }}>
					FORTUNATO
				</h1>
				<p className="section-label">Senior Full-Stack Engineer &amp; Technical Lead</p>
				<p style={{ color: 'var(--text-secondary)', maxWidth: '600px', marginTop: 'var(--space-lg)' }}>
					I <strong>build</strong>, <strong>fix</strong>, and <strong>lead</strong> TypeScript platforms.
				</p>
			</div>
		</section>
	)
}
