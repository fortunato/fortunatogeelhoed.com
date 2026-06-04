import type { HomeContent } from '@fg/shared';
import homeData from '../../../content/home.json';
import { CallToAction } from '../components/home/CallToAction';
import { Hero } from '../components/home/Hero';
import { LatestWriting } from '../components/home/LatestWriting';
import { ProofStrip } from '../components/home/ProofStrip';
import { Services } from '../components/home/Services';

const home = homeData as HomeContent;

export function Home() {
	return (
		<>
			<Hero hero={home.hero} />
			<Services services={home.services} />
			<ProofStrip proof={home.proof} />
			<LatestWriting writing={home.writing} />
			<CallToAction cta={home.cta} />
		</>
	);
}
