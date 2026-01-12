/**
 * Prospective Event Data Model
 *
 * Represents a potential future parkrun event with comprehensive tracking
 * of prospect status, ambassador assignments, and allocation impact.
 */

export interface ProspectiveEvent {
  // Identity
  id: string; // Auto-generated unique identifier

  // Event Details
  prospectEvent: string; // Name of the prospective event
  country: string; // Country where event would be held
  state: string; // State/region information
  prospectEDs: string; // Prospect Event Director(s) name
  eventAmbassador: string; // Assigned Event Ambassador

  // Status Flags
  courseFound: boolean; // Whether suitable course has been found
  landownerPermission: boolean; // Whether landowner permission obtained
  fundingConfirmed: boolean; // Whether funding is confirmed

  // Timeline
  dateMadeContact: Date | null; // When contact was first made

  // Location (may be incomplete)
  coordinates?: [number, number]; // Lat/lng if geocoded

  // Processing Status
  geocodingStatus: 'pending' | 'success' | 'failed' | 'manual';
  ambassadorMatchStatus: 'pending' | 'matched' | 'unmatched';

  // Metadata
  importTimestamp: number;
  sourceRow: number; // Original CSV row for reference
  edit?: string; // Edit notes or additional information
  notes?: string; // User-added notes or issues
}

/**
 * Allocation impact tracking for prospective events
 */
export interface AllocationImpact {
  previousEA?: {
    id: string;
    allocationChange: number;
  };
  newEA: {
    id: string;
    allocationChange: number;
  };
}

/**
 * Result of prospect allocation operation
 */
export interface AllocationResult {
  success: boolean;
  prospect: ProspectiveEvent;
  previousAmbassador?: string;
  newAmbassador: string;
  allocationImpact: AllocationImpact;
}