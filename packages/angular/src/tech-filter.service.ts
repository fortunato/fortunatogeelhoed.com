import { Injectable, signal } from '@angular/core';

// Active tech-pill filters for the timeline, idiomatic Angular: a root-provided signal service,
// so the selection is a singleton that survives navigating away and back. Deep pill buttons
// inject the same instance — no @Input threading. The Set is replaced on every write. The URL +
// sessionStorage mirroring lives in the timeline page (TimelineComponent), so the URL is only
// bound while that page is mounted.
@Injectable({ providedIn: 'root' })
export class TechFilterService {
	private readonly _active = signal<ReadonlySet<string>>(new Set());
	readonly active = this._active.asReadonly();

	isActive(name: string): boolean {
		return this._active().has(name);
	}

	toggle(name: string): void {
		const next = new Set(this._active());
		if (!next.delete(name)) next.add(name);
		this._active.set(next);
	}

	clear(): void {
		if (this._active().size) this._active.set(new Set());
	}

	setActive(names: Iterable<string>): void {
		this._active.set(new Set(names));
	}
}
