// Technology visuals for the timeline. The registry + sprite are generated from the
// simple-icons package (real brand glyphs + colors) by scripts/build-tech-icons.ts. Pills
// reference the sprite via <use href="#i-<icon>">; techs without a glyph render a brand-
// tinted text pill.
import { TECH_REGISTRY } from './tech-icons.generated';

export interface TechVisual {
	brand: string;
	/** Sprite symbol id suffix (referenced as `#i-<icon>`), if the tech has a glyph. */
	icon?: string;
}

export { TECH_REGISTRY };

export function techVisual(name: string): TechVisual {
	return TECH_REGISTRY[name] ?? { brand: '#888888' };
}
