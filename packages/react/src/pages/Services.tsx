import { ContentPage } from '../components/ContentPage';
import { useContent } from '../content';

export function Services() {
	return <ContentPage label="Services" content={useContent('services')} />;
}
