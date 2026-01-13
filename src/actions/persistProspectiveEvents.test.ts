/**
 * Prospective Events Persistence Tests
 */

import { saveProspectiveEvents, loadProspectiveEvents, clearProspectiveEvents, hasProspectiveEvents, getProspectiveEventsMetadata } from './persistProspectiveEvents';
import { ProspectiveEvent } from '../models/ProspectiveEvent';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('persistProspectiveEvents', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('saveProspectiveEvents', () => {
    it('should save prospective events to localStorage', () => {
      const events: ProspectiveEvent[] = [
        {
          id: 'test-1',
          prospectEvent: 'Test Park',
          country: 'Australia',
          state: 'VIC',
          prospectEDs: 'John Doe',
          eventAmbassador: 'Jane Smith',
          dateMadeContact: new Date('2024-01-15'),
          courseFound: true,
          landownerPermission: false,
          fundingConfirmed: true,
          coordinates: { latitude: -37.8136, longitude: 144.9631 },
          geocodingStatus: 'success',
          ambassadorMatchStatus: 'matched',
          importTimestamp: Date.now(),
          sourceRow: 1
        }
      ];

      saveProspectiveEvents(events);

      const stored = localStorageMock.getItem('prospectiveEvents');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.events).toHaveLength(1);
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.lastModified).toBeGreaterThan(0);
    });

    it('should handle empty array', () => {
      saveProspectiveEvents([]);
      const stored = localStorageMock.getItem('prospectiveEvents');
      expect(stored).toBeTruthy();
    });
  });

  describe('loadProspectiveEvents', () => {
    it('should load prospective events from localStorage and convert dates', () => {
      const originalDate = new Date('2024-01-15');
      const events: ProspectiveEvent[] = [
        {
          id: 'test-1',
          prospectEvent: 'Test Park',
          country: 'Australia',
          state: 'VIC',
          prospectEDs: 'John Doe',
          eventAmbassador: 'Jane Smith',
          dateMadeContact: originalDate,
          courseFound: true,
          landownerPermission: false,
          fundingConfirmed: true,
          coordinates: { latitude: -37.8136, longitude: 144.9631 },
          geocodingStatus: 'success',
          ambassadorMatchStatus: 'matched',
          importTimestamp: Date.now(),
          sourceRow: 1
        }
      ];

      // Save and then load
      saveProspectiveEvents(events);
      const loadedEvents = loadProspectiveEvents();

      expect(loadedEvents).toHaveLength(1);
      expect(loadedEvents[0].dateMadeContact).toEqual(originalDate);
      expect(loadedEvents[0].dateMadeContact).toBeInstanceOf(Date);
    });

    it('should handle null dateMadeContact', () => {
      const events: ProspectiveEvent[] = [
        {
          id: 'test-1',
          prospectEvent: 'Test Park',
          country: 'Australia',
          state: 'VIC',
          prospectEDs: 'John Doe',
          eventAmbassador: 'Jane Smith',
          dateMadeContact: null,
          courseFound: true,
          landownerPermission: false,
          fundingConfirmed: true,
          geocodingStatus: 'success',
          ambassadorMatchStatus: 'matched',
          importTimestamp: Date.now(),
          sourceRow: 1
        }
      ];

      saveProspectiveEvents(events);
      const loadedEvents = loadProspectiveEvents();

      expect(loadedEvents).toHaveLength(1);
      expect(loadedEvents[0].dateMadeContact).toBeNull();
    });

    it('should return empty array when no data exists', () => {
      const loadedEvents = loadProspectiveEvents();
      expect(loadedEvents).toEqual([]);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.setItem('prospectiveEvents', 'invalid json');
      const loadedEvents = loadProspectiveEvents();
      expect(loadedEvents).toEqual([]);
    });
  });

  describe('clearProspectiveEvents', () => {
    it('should clear prospective events from localStorage', () => {
      const events: ProspectiveEvent[] = [
        {
          id: 'test-1',
          prospectEvent: 'Test Park',
          country: 'Australia',
          state: 'VIC',
          prospectEDs: 'John Doe',
          eventAmbassador: 'Jane Smith',
          dateMadeContact: new Date(),
          courseFound: true,
          landownerPermission: false,
          fundingConfirmed: true,
          geocodingStatus: 'success',
          ambassadorMatchStatus: 'matched',
          importTimestamp: Date.now(),
          sourceRow: 1
        }
      ];

      saveProspectiveEvents(events);
      expect(hasProspectiveEvents()).toBe(true);

      clearProspectiveEvents();
      expect(hasProspectiveEvents()).toBe(false);
    });
  });

  describe('hasProspectiveEvents', () => {
    it('should return true when data exists', () => {
      const events: ProspectiveEvent[] = [
        {
          id: 'test-1',
          prospectEvent: 'Test Park',
          country: 'Australia',
          state: 'VIC',
          prospectEDs: 'John Doe',
          eventAmbassador: 'Jane Smith',
          dateMadeContact: new Date(),
          courseFound: true,
          landownerPermission: false,
          fundingConfirmed: true,
          geocodingStatus: 'success',
          ambassadorMatchStatus: 'matched',
          importTimestamp: Date.now(),
          sourceRow: 1
        }
      ];

      saveProspectiveEvents(events);
      expect(hasProspectiveEvents()).toBe(true);
    });

    it('should return false when no data exists', () => {
      expect(hasProspectiveEvents()).toBe(false);
    });
  });

  describe('getProspectiveEventsMetadata', () => {
    it('should return metadata when data exists', () => {
      const events: ProspectiveEvent[] = [
        {
          id: 'test-1',
          prospectEvent: 'Test Park',
          country: 'Australia',
          state: 'VIC',
          prospectEDs: 'John Doe',
          eventAmbassador: 'Jane Smith',
          dateMadeContact: new Date(),
          courseFound: true,
          landownerPermission: false,
          fundingConfirmed: true,
          geocodingStatus: 'success',
          ambassadorMatchStatus: 'matched',
          importTimestamp: Date.now(),
          sourceRow: 1
        }
      ];

      saveProspectiveEvents(events);
      const metadata = getProspectiveEventsMetadata();

      expect(metadata).toBeTruthy();
      expect(metadata!.count).toBe(1);
      expect(metadata!.version).toBe('1.0.0');
      expect(metadata!.lastModified).toBeGreaterThan(0);
    });

    it('should return null when no data exists', () => {
      const metadata = getProspectiveEventsMetadata();
      expect(metadata).toBeNull();
    });
  });
});