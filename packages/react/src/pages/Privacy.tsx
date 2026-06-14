import { ContentPage } from '../components/ContentPage';
import { useContent } from '../content';

export function Privacy() {
	return <ContentPage label="Privacy" content={useContent('privacy')} />;
}
