/**
 * Create Prospect From Address
 *
 * Core business logic for creating a prospect from address entry data.
 * Validates input, generates ID, creates ProspectiveEvent, and updates EA allocation count.
 */

import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { Coordinate, isValidCoordinate } from "@models/Coordinate";
import { validateProspectiveEvent } from "@utils/prospectValidation";

export interface ProspectCreationData {
  prospectEvent: string;
  address: string; // Used for reference, not stored
  state: string;
  coordinates: Coordinate;
  country: string;
  eventAmbassador: string;
  prospectEDs?: string;
  dateMadeContact?: Date | null;
  courseFound?: boolean;
  landownerPermission?: boolean;
  fundingConfirmed?: boolean;
  geocodingStatus?: 'success' | 'manual';
}

/**
 * Generate a unique ID for a prospective event
 * Duplicated from parseProspectiveEvents.ts since it's not exported
 */
function generateProspectiveEventId(prospectEvent: string, country: string, state: string): string {
  const base = `${prospectEvent}-${country}-${state}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${timestamp}-${random}`;
}

/**
 * Core business logic for creating a prospect from address entry data.
 * Validates all required fields, generates unique ID, creates ProspectiveEvent,
 * validates the prospect, and updates EA allocation count.
 *
 * @param prospectData - Object containing prospect details
 * @param eventAmbassadors - Map of all Event Ambassadors (for validation and allocation count update)
 * @param regionalAmbassadors - Map of all Regional Ambassadors (for REA inference - reserved for future use)
 * @returns Created ProspectiveEvent object
 * @throws Error if validation fails, EA not found, or coordinates invalid
 */
export function createProspectFromAddress(
  prospectData: ProspectCreationData,
  eventAmbassadors: EventAmbassadorMap,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  regionalAmbassadors: RegionalAmbassadorMap
): ProspectiveEvent {
  // Validate required fields
  if (!prospectData.prospectEvent?.trim()) {
    throw new Error("Prospect name is required");
  }

  if (!prospectData.country?.trim()) {
    throw new Error("Country is required");
  }

  // Handle country inference failure - allow "Unknown" but warn
  if (prospectData.country === "Unknown") {
    // Allow creation with "Unknown" country, but this should ideally be avoided
    // The validation will accept it, but the prospect may need manual correction
  }

  if (!prospectData.state?.trim()) {
    throw new Error("State is required");
  }

  if (!prospectData.eventAmbassador?.trim()) {
    throw new Error("Event Ambassador is required");
  }

  if (!prospectData.coordinates) {
    throw new Error("Coordinates are required");
  }

  if (!isValidCoordinate(prospectData.coordinates)) {
    throw new Error("Invalid coordinates");
  }

  // Validate EA exists
  const ea = eventAmbassadors.get(prospectData.eventAmbassador);
  if (!ea) {
    throw new Error(`Event Ambassador "${prospectData.eventAmbassador}" not found`);
  }

  // Generate unique ID
  const id = generateProspectiveEventId(
    prospectData.prospectEvent,
    prospectData.country,
    prospectData.state
  );

  // Determine geocoding status (default to 'success' if not specified)
  const geocodingStatus = prospectData.geocodingStatus || 'success';

  // Create ProspectiveEvent with all provided data and defaults
  const prospect: ProspectiveEvent = {
    id,
    prospectEvent: prospectData.prospectEvent.trim(),
    country: prospectData.country.trim(),
    state: prospectData.state.trim(),
    prospectEDs: prospectData.prospectEDs?.trim() || "",
    eventAmbassador: prospectData.eventAmbassador.trim(),
    courseFound: prospectData.courseFound ?? false,
    landownerPermission: prospectData.landownerPermission ?? false,
    fundingConfirmed: prospectData.fundingConfirmed ?? false,
    dateMadeContact: prospectData.dateMadeContact || null,
    coordinates: prospectData.coordinates,
    geocodingStatus,
    ambassadorMatchStatus: 'matched', // EA is assigned during creation
    importTimestamp: Date.now(),
    sourceRow: -1, // Indicates manual creation (not from CSV)
  };

  // Validate the complete prospect
  const validation = validateProspectiveEvent(prospect);
  if (!validation.isValid) {
    const errorMessages = validation.errors.map(e => e.message).join(', ');
    throw new Error(`Validation failed: ${errorMessages}`);
  }

  // Update EA allocation count to include new prospect
  if (!ea.prospectiveEvents) {
    ea.prospectiveEvents = [];
  }
  ea.prospectiveEvents.push(prospect.id);

  return prospect;
}
