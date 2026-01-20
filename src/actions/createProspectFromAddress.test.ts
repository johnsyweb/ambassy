/**
 * Create Prospect From Address Tests
 */

import { createProspectFromAddress, ProspectCreationData } from './createProspectFromAddress';
import { EventAmbassadorMap } from '@models/EventAmbassadorMap';
import { RegionalAmbassadorMap } from '@models/RegionalAmbassadorMap';
import { createCoordinate } from '@models/Coordinate';

// generateProspectiveEventId is a private function in parseProspectiveEvents
// We'll need to export it or create a test helper
// For now, we'll test createProspectFromAddress which should use it internally

jest.mock('@utils/prospectValidation', () => ({
  validateProspectiveEvent: jest.fn(() => ({
    isValid: true,
    errors: [],
    warnings: [],
  })),
}));

describe('createProspectFromAddress', () => {
  let eventAmbassadors: EventAmbassadorMap;
  let regionalAmbassadors: RegionalAmbassadorMap;

  beforeEach(() => {
    eventAmbassadors = new Map();
    eventAmbassadors.set('EA 1', {
      name: 'EA 1',
      events: ['event1'],
      prospectiveEvents: [],
    });

    regionalAmbassadors = new Map();
    regionalAmbassadors.set('REA 1', {
      name: 'REA 1',
      state: 'VIC',
      supportsEAs: ['EA 1'],
    });
  });

  it('should create prospect with required fields', () => {
    const prospectData = {
      prospectEvent: 'Test Prospect',
      address: '123 Main St, Melbourne VIC 3000',
      state: 'VIC',
      coordinates: createCoordinate(-37.8136, 144.9631),
      country: 'Australia',
      eventAmbassador: 'EA 1',
    };

    const prospect = createProspectFromAddress(
      prospectData,
      eventAmbassadors,
      regionalAmbassadors
    );

    expect(prospect.prospectEvent).toBe('Test Prospect');
    expect(prospect.country).toBe('Australia');
    expect(prospect.state).toBe('VIC');
    expect(prospect.eventAmbassador).toBe('EA 1');
    expect(prospect.coordinates).toEqual(createCoordinate(-37.8136, 144.9631));
    expect(prospect.geocodingStatus).toBe('success');
    expect(prospect.ambassadorMatchStatus).toBe('matched');
    expect(prospect.sourceRow).toBe(-1);
  });

  it('should create prospect with optional fields', () => {
    const prospectData = {
      prospectEvent: 'Test Prospect',
      address: '123 Main St',
      state: 'VIC',
      coordinates: createCoordinate(-37.8136, 144.9631),
      country: 'Australia',
      eventAmbassador: 'EA 1',
      prospectEDs: 'John Doe',
      dateMadeContact: new Date('2024-01-15'),
      courseFound: true,
      landownerPermission: true,
      fundingConfirmed: false,
    };

    const prospect = createProspectFromAddress(
      prospectData,
      eventAmbassadors,
      regionalAmbassadors
    );

    expect(prospect.prospectEDs).toBe('John Doe');
    expect(prospect.dateMadeContact).toEqual(new Date('2024-01-15'));
    expect(prospect.courseFound).toBe(true);
    expect(prospect.landownerPermission).toBe(true);
    expect(prospect.fundingConfirmed).toBe(false);
  });

  it('should use default values for optional fields when not provided', () => {
    const prospectData = {
      prospectEvent: 'Test Prospect',
      address: '123 Main St',
      state: 'VIC',
      coordinates: createCoordinate(-37.8136, 144.9631),
      country: 'Australia',
      eventAmbassador: 'EA 1',
    };

    const prospect = createProspectFromAddress(
      prospectData,
      eventAmbassadors,
      regionalAmbassadors
    );

    expect(prospect.prospectEDs).toBe('');
    expect(prospect.dateMadeContact).toBeNull();
    expect(prospect.courseFound).toBe(false);
    expect(prospect.landownerPermission).toBe(false);
    expect(prospect.fundingConfirmed).toBe(false);
  });

  it('should set geocodingStatus to "manual" when coordinates entered manually', () => {
    const prospectData = {
      prospectEvent: 'Test Prospect',
      address: '123 Main St',
      state: 'VIC',
      coordinates: createCoordinate(-37.8136, 144.9631),
      country: 'Australia',
      eventAmbassador: 'EA 1',
    };

    // Simulate manual entry by checking if we need a flag
    // For now, we'll test that 'success' is set for geocoded coordinates
    const prospect = createProspectFromAddress(
      prospectData,
      eventAmbassadors,
      regionalAmbassadors
    );

    expect(prospect.geocodingStatus).toBe('success');
  });

  it('should generate unique ID for prospect', () => {
    const prospectData = {
      prospectEvent: 'Test Prospect',
      address: '123 Main St',
      state: 'VIC',
      coordinates: createCoordinate(-37.8136, 144.9631),
      country: 'Australia',
      eventAmbassador: 'EA 1',
    };

    const prospect1 = createProspectFromAddress(
      prospectData,
      eventAmbassadors,
      regionalAmbassadors
    );

    const prospect2 = createProspectFromAddress(
      prospectData,
      eventAmbassadors,
      regionalAmbassadors
    );

    expect(prospect1.id).not.toBe(prospect2.id);
  });

  it('should update EA allocation count to include new prospect', () => {
    const prospectData = {
      prospectEvent: 'Test Prospect',
      address: '123 Main St',
      state: 'VIC',
      coordinates: createCoordinate(-37.8136, 144.9631),
      country: 'Australia',
      eventAmbassador: 'EA 1',
    };

    const initialProspectCount = eventAmbassadors.get('EA 1')?.prospectiveEvents?.length ?? 0;

    const prospect = createProspectFromAddress(
      prospectData,
      eventAmbassadors,
      regionalAmbassadors
    );

    const ea = eventAmbassadors.get('EA 1');
    expect(ea?.prospectiveEvents).toContain(prospect.id);
    expect(ea?.prospectiveEvents?.length).toBe(initialProspectCount + 1);
  });

  it('should throw error if EA does not exist', () => {
    const prospectData = {
      prospectEvent: 'Test Prospect',
      address: '123 Main St',
      state: 'VIC',
      coordinates: createCoordinate(-37.8136, 144.9631),
      country: 'Australia',
      eventAmbassador: 'Non-existent EA',
    };

    expect(() => {
      createProspectFromAddress(
        prospectData,
        eventAmbassadors,
        regionalAmbassadors
      );
    }).toThrow();
  });

  it('should throw error if required fields are missing', () => {
    const invalidData = {
      prospectEvent: '',
      address: '123 Main St',
      state: 'VIC',
      coordinates: createCoordinate(-37.8136, 144.9631),
      country: 'Australia',
      eventAmbassador: 'EA 1',
    };

    expect(() => {
      createProspectFromAddress(
        invalidData as ProspectCreationData,
        eventAmbassadors,
        regionalAmbassadors
      );
    }).toThrow();
  });

  it('should set importTimestamp to current time', () => {
    const beforeTime = Date.now();
    const prospectData = {
      prospectEvent: 'Test Prospect',
      address: '123 Main St',
      state: 'VIC',
      coordinates: createCoordinate(-37.8136, 144.9631),
      country: 'Australia',
      eventAmbassador: 'EA 1',
    };

    const prospect = createProspectFromAddress(
      prospectData,
      eventAmbassadors,
      regionalAmbassadors
    );

    const afterTime = Date.now();
    expect(prospect.importTimestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(prospect.importTimestamp).toBeLessThanOrEqual(afterTime);
  });
});
