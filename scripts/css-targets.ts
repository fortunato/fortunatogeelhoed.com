import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';

// Browser targets are defined once in the repo-root .browserslistrc and read by
// BOTH lightningcss (here) and Angular's compiler, so the two CSS pipelines
// prefix/downlevel to the same Baseline "Widely available" floor
// and cannot diverge as component CSS grows. Newest-tier features stay authored
// as progressive enhancements.
export const cssTargets = browserslistToTargets(browserslist());
