import homeData from '@fg/content-data/home.json';
import type { HomeContent } from '@fg/shared';
import { CallToAction } from '../components/home/CallToAction';
import { FrameworkExposure } from '../components/home/FrameworkExposure';
import { Hero } from '../components/home/Hero';
import { LatestWriting } from '../components/home/LatestWriting';
import { ProofStrip } from '../components/home/ProofStrip';
import { Services } from '../components/home/Services';

const home = homeData as HomeContent;

export function Home() {
	return (
		<>
			<Hero hero={home.hero} />
			<Services services={home.services} copy={home.sections.services} />
			<FrameworkExposure copy={home.sections.frameworks} />
			<ProofStrip proof={home.proof} copy={home.sections.proof} />
			<LatestWriting writing={home.writing} copy={home.sections.writing} />
			<CallToAction cta={home.cta} />
		</>
	);
}
