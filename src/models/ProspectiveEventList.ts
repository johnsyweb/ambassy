/**
 * Prospective Event List Collection Manager
 *
 * Manages collections of prospective events with allocation tracking
 * and provides utilities for querying and managing prospect data.
 */

import { ProspectiveEvent } from './ProspectiveEvent';
import { EventAmbassadorMap } from './EventAmbassadorMap';

export class ProspectiveEventList {
  private events: Map<string, ProspectiveEvent> = new Map();

  constructor(initialEvents: ProspectiveEvent[] = []) {
    for (const event of initialEvents) {
      this.events.set(event.id, event);
    }
  }

  /**
   * Add a prospective event to the collection
   */
  add(event: ProspectiveEvent): void {
    this.events.set(event.id, event);
  }

  /**
   * Remove a prospective event by ID
   */
  remove(id: string): boolean {
    return this.events.delete(id);
  }

  /**
   * Find a prospective event by ID
   */
  findById(id: string): ProspectiveEvent | undefined {
    return this.events.get(id);
  }

  /**
   * Get all events as an array
   */
  getAll(): ProspectiveEvent[] {
    return Array.from(this.events.values());
  }

  /**
   * Get events that have unresolved issues
   */
  getUnresolved(): ProspectiveEvent[] {
    return this.getAll().filter(event =>
      event.geocodingStatus === 'pending' ||
      event.geocodingStatus === 'failed' ||
      event.ambassadorMatchStatus === 'unmatched'
    );
  }

  /**
   * Get events that are fully resolved
   */
  getResolved(): ProspectiveEvent[] {
    return this.getAll().filter(event =>
      event.geocodingStatus === 'success' &&
      event.ambassadorMatchStatus === 'matched'
    );
  }

  /**
   * Get prospects assigned to a specific ambassador
   */
  getByAmbassador(ambassadorId: string): ProspectiveEvent[] {
    return this.getAll().filter(event =>
      event.eventAmbassador === ambassadorId
    );
  }

  /**
   * Get allocation count for a specific ambassador
   */
  getAllocationCount(ambassadorId: string): number {
    return this.getByAmbassador(ambassadorId).length;
  }

  /**
   * Get the Regional Ambassador for a prospect (inferred from EA)
   */
  getRegionalAmbassador(prospectId: string, eventAmbassadors: EventAmbassadorMap): string | undefined {
    const prospect = this.findById(prospectId);
    if (!prospect) return undefined;

    const ea = eventAmbassadors.get(prospect.eventAmbassador);
    return ea?.regionalAmbassador;
  }

  /**
   * Get prospects by Regional Ambassador (inferred relationship)
   */
  getByRegionalAmbassador(raId: string, eventAmbassadors: EventAmbassadorMap): ProspectiveEvent[] {
    return this.getAll().filter(prospect => {
      const ea = eventAmbassadors.get(prospect.eventAmbassador);
      return ea?.regionalAmbassador === raId;
    });
  }

  /**
   * Update an existing prospective event
   */
  update(event: ProspectiveEvent): void {
    if (this.events.has(event.id)) {
      this.events.set(event.id, event);
    }
  }

  /**
   * Get events by geocoding status
   */
  getByGeocodingStatus(status: ProspectiveEvent['geocodingStatus']): ProspectiveEvent[] {
    return this.getAll().filter(event => event.geocodingStatus === status);
  }

  /**
   * Get events by ambassador match status
   */
  getByAmbassadorMatchStatus(status: ProspectiveEvent['ambassadorMatchStatus']): ProspectiveEvent[] {
    return this.getAll().filter(event => event.ambassadorMatchStatus === status);
  }

  /**
   * Get total count of events
   */
  get size(): number {
    return this.events.size;
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events.clear();
  }

  /**
   * Export events for serialization
   */
  toJSON(): ProspectiveEvent[] {
    return this.getAll();
  }

  /**
   * Import events from serialized data
   */
  static fromJSON(data: ProspectiveEvent[]): ProspectiveEventList {
    return new ProspectiveEventList(data);
  }
}