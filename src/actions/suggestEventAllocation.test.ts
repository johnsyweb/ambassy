/**
 * Event Allocation Suggestion Tests
 */

import { generateProspectAllocationSuggestions } from './suggestEventAllocation';
import { EventAmbassadorMap } from '@models/EventAmbassadorMap';
import { RegionalAmbassadorMap } from '@models/RegionalAmbassadorMap';
import { EventDetailsMap } from '@models/EventDetailsMap';
import { createCoordinate } from '@models/Coordinate';
import { getCountryCodeFromCoordinate } from '@models/country';

jest.mock('./checkCapacity', () => ({
  loadCapacityLimits: jest.fn(() => ({
    eventAmbassadorMin: 0,
    eventAmbassadorMax: 10,
  })),
}));

jest.mock('@utils/regions', () => ({
  getRegionalAmbassadorForEventAmbassador: jest.fn(() => null),
}));

jest.mock('@models/country', () => ({
  getCountryCodeFromCoordinate: jest.fn(),
}));

describe('generateProspectAllocationSuggestions', () => {
  let eventAmbassadors: EventAmbassadorMap;
  let regionalAmbassadors: RegionalAmbassadorMap;
  let eventDetails: EventDetailsMap;

  beforeEach(() => {
    eventAmbassadors = new Map();
    eventAmbassadors.set('EA 1', {
      name: 'EA 1',
      events: ['event1'],
      prospectiveEvents: [],
    });
    eventAmbassadors.set('EA 2', {
      name: 'EA 2',
      events: [],
      prospectiveEvents: [],
    });

    regionalAmbassadors = new Map();
    regionalAmbassadors.set('REA 1', {
      name: 'REA 1',
      state: 'VIC',
      supportsEAs: ['EA 1', 'EA 2'],
    });

    eventDetails = new Map();
    eventDetails.set('event1', {
      id: '1',
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [144.9631, -37.8136], // GeoJSON: [lng, lat]
      },
      properties: {
        eventname: 'event1',
        EventLongName: 'Event 1',
        EventShortName: 'event1',
        LocalisedEventLongName: null,
        countrycode: 3,
        seriesid: 1,
        EventLocation: 'Melbourne',
      },
    });

    (getCountryCodeFromCoordinate as jest.Mock).mockResolvedValue(3);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate suggestions for prospect using temporary EventDetails entry', async () => {
    const prospectName = 'New Prospect';
    const coordinates = createCoordinate(-37.8136, 144.9631); // Melbourne

    const suggestions = await generateProspectAllocationSuggestions(
      prospectName,
      coordinates,
      eventAmbassadors,
      eventDetails,
      regionalAmbassadors
    );

    expect(suggestions).toBeDefined();
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);
    
    // Verify temporary entry was cleaned up
    const hasTempEntry = Array.from(eventDetails.keys()).some(key => key.startsWith('prospect-'));
    expect(hasTempEntry).toBe(false);
  });

  it('should return empty array when no EAs available', async () => {
    const emptyEAs = new Map();
    const prospectName = 'New Prospect';
    const coordinates = createCoordinate(-37.8136, 144.9631);

    const suggestions = await generateProspectAllocationSuggestions(
      prospectName,
      coordinates,
      emptyEAs,
      eventDetails,
      regionalAmbassadors
    );

    expect(suggestions).toEqual([]);
  });

  it('should create temporary EventDetails with correct coordinates', async () => {
    const prospectName = 'Test Prospect';
    const coordinates = createCoordinate(-37.8136, 144.9631);

    const suggestions = await generateProspectAllocationSuggestions(
      prospectName,
      coordinates,
      eventAmbassadors,
      eventDetails,
      regionalAmbassadors
    );

    // Verify suggestions were generated (indicates temp entry was created)
    expect(suggestions.length).toBeGreaterThan(0);
    
    // Verify each suggestion has correct structure
    suggestions.forEach(suggestion => {
      expect(suggestion.toAmbassador).toBeDefined();
      expect(Array.isArray(suggestion.items)).toBe(true);
      // Check if any item matches the pattern (temp entry was used)
      const hasTempEntry = suggestion.items.some(item => /^prospect-test-prospect-/.test(item));
      expect(hasTempEntry).toBe(true);
      expect(suggestion.score).toBeGreaterThanOrEqual(0);
    });
  });

  it('should clean up temporary EventDetails entry after generating suggestions', async () => {
    const initialSize = eventDetails.size;
    const prospectName = 'Cleanup Test';
    const coordinates = createCoordinate(-37.8136, 144.9631);

    await generateProspectAllocationSuggestions(
      prospectName,
      coordinates,
      eventAmbassadors,
      eventDetails,
      regionalAmbassadors
    );

    // Verify no temporary entries remain
    const tempEntries = Array.from(eventDetails.keys()).filter(key => key.startsWith('prospect-'));
    expect(tempEntries.length).toBe(0);
    expect(eventDetails.size).toBe(initialSize);
  });
});
