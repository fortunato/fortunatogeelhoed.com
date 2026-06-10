import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { Availability } from '@fg/shared';
import { afterEach, describe, expect, it } from 'vitest';
import { AvailabilityService } from './availability.service';

// Availability data layer (Angular): the optimistic default before any seed, reading the
// server-injected seed for the first render, and replacing it with the live httpResource result.
// Mirrors the React hook and Vue composable tests so the same data behaviour holds across all
// three frameworks. The HTTP layer is mocked with HttpTestingController; the seed lives in a real
// DOM element. The service reads its seed at construction, so the seed must be set before inject.

function seedDocument(value: unknown | null): void {
	document.getElementById('jb-availability')?.remove();
	if (value === null) return;
	const script = document.createElement('script');
	script.id = 'jb-availability';
	script.type = 'application/json';
	script.textContent = JSON.stringify(value);
	document.body.append(script);
}

// httpResource issues its request from a reactive effect; a tick flushes that scheduling so the
// pending request appears on the testing controller.
function tick(): void {
	TestBed.inject(ApplicationRef).tick();
}

// A fresh module per test, with the seed already in place so the service reads it at construction.
function setup(seed: unknown | null): {
	service: AvailabilityService;
	http: HttpTestingController;
} {
	TestBed.resetTestingModule();
	seedDocument(seed);
	TestBed.configureTestingModule({
		providers: [provideHttpClient(), provideHttpClientTesting()],
	});
	return {
		service: TestBed.inject(AvailabilityService),
		http: TestBed.inject(HttpTestingController),
	};
}

afterEach(() => {
	seedDocument(null);
	TestBed.resetTestingModule();
});

describe('AvailabilityService (Angular)', () => {
	it('falls back to the optimistic available default when there is no seed', () => {
		const { service } = setup(null);
		expect(service.availability()).toEqual({ available: true, until: '' });
	});

	it('uses the server-injected seed before the live value resolves', () => {
		const { service } = setup({ available: false, until: 'August 2026' });
		expect(service.availability()).toEqual({ available: false, until: 'August 2026' });
	});

	it('replaces the seed with the live value once the request resolves', async () => {
		const { service, http } = setup({ available: true, until: '' });
		tick();
		const req = http.expectOne('/api/availability');
		const live: Availability = { available: false, until: 'September 2026' };
		req.flush(live);
		// httpResource exposes the parsed body through its value signal on a later turn; let the
		// application settle before reading the derived availability.
		await TestBed.inject(ApplicationRef).whenStable();
		tick();
		expect(service.availability()).toEqual(live);
		http.verify();
	});

	it('keeps the seed when the live request errors', () => {
		const { service, http } = setup({ available: true, until: '' });
		tick();
		const req = http.expectOne('/api/availability');
		req.flush('boom', { status: 500, statusText: 'Server Error' });
		tick();
		expect(service.availability()).toEqual({ available: true, until: '' });
		http.verify();
	});

	it('keeps the seed when the live body is malformed', () => {
		const { service, http } = setup({ available: true, until: '' });
		tick();
		const req = http.expectOne('/api/availability');
		req.flush({ available: 'maybe' });
		tick();
		expect(service.availability()).toEqual({ available: true, until: '' });
		http.verify();
	});
});
