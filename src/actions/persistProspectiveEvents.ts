/**
 * Prospective Events Persistence
 *
 * Handles saving and loading prospective events to/from localStorage
 * with proper data migration and backward compatibility.
 */

import { ProspectiveEvent } from '../models/ProspectiveEvent';
import { ProspectiveEventsStorage } from '@localtypes/ProspectiveEventTypes';

const STORAGE_KEY = 'prospectiveEvents';
const STORAGE_VERSION = '1.0.0';

/**
 * Save prospective events to localStorage
 */
export function saveProspectiveEvents(events: ProspectiveEvent[]): void {
  try {
    const storageData: ProspectiveEventsStorage = {
      events,
      version: STORAGE_VERSION,
      lastModified: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.error('Failed to save prospective events:', error);
    throw new Error('Failed to save prospective events to localStorage');
  }
}

/**
 * Load prospective events from localStorage
 */
export function loadProspectiveEvents(): ProspectiveEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const storageData: ProspectiveEventsStorage = JSON.parse(stored);

    // Handle version migration if needed
    if (storageData.version !== STORAGE_VERSION) {
      console.warn(`Migrating prospective events from version ${storageData.version} to ${STORAGE_VERSION}`);
      // Add migration logic here if needed in future versions
    }

    // Convert date strings back to Date objects
    const events = storageData.events || [];
    return events.map(event => ({
      ...event,
      dateMadeContact: event.dateMadeContact ? new Date(event.dateMadeContact) : null
    }));
  } catch (error) {
    console.error('Failed to load prospective events:', error);
    return [];
  }
}

/**
 * Clear all prospective events from storage
 */
export function clearProspectiveEvents(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear prospective events:', error);
  }
}

/**
 * Check if prospective events exist in storage
 */
export function hasProspectiveEvents(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Get storage metadata without loading full data
 */
export function getProspectiveEventsMetadata(): { count: number; lastModified: number; version: string } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const storageData: ProspectiveEventsStorage = JSON.parse(stored);
    return {
      count: storageData.events?.length || 0,
      lastModified: storageData.lastModified,
      version: storageData.version
    };
  } catch (error) {
    console.error('Failed to get prospective events metadata:', error);
    return null;
  }
}