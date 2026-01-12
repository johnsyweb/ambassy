/**
 * TypeScript Type Definitions for Prospective Events
 *
 * Contains all interfaces, types, and contracts for the prospective events feature.
 */

import { ProspectiveEvent, AllocationResult } from '../models/ProspectiveEvent';

// CSV Import and Parsing Types
export interface CSVImportOptions {
  validateHeaders?: boolean;
  skipEmptyRows?: boolean;
  dateFormat?: string;
}

export interface CSVParseResult {
  events: ProspectiveEvent[];
  errors: CSVParseError[];
  warnings: string[];
}

export interface CSVParseError {
  row: number;
  column?: string;
  value?: string;
  message: string;
}

// Ambassador Matching Types
export interface AmbassadorMatchResult {
  matched: ProspectiveEvent[];
  unmatched: ProspectiveEvent[];
  ambiguous: Array<{
    event: ProspectiveEvent;
    candidates: string[];
  }>;
}

// Geocoding Types
export interface GeocodeResult {
  geocoded: ProspectiveEvent[];
  failed: ProspectiveEvent[];
  ambiguous: Array<{
    event: ProspectiveEvent;
    suggestions: GeocodeSuggestion[];
  }>;
}

export interface GeocodeSuggestion {
  address: string;
  coordinates: [number, number];
  confidence: number;
}

// Import Pipeline Types
export interface ImportResult {
  success: boolean;
  events: ProspectiveEvent[];
  errors: string[];
  warnings: string[];
  stats: ImportStats;
}

export interface ImportStats {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  geocodingAttempts: number;
  ambassadorMatches: number;
}

// UI Integration Types
export interface ProspectsTabOptions {
  showResolved?: boolean;
  showUnresolved?: boolean;
  filterByAmbassador?: string;
  sortBy?: 'name' | 'date' | 'status';
}

export interface MapLayerOptions {
  showProspects?: boolean;
  prospectStyle?: 'default' | 'status' | 'ambassador';
  clusterProspects?: boolean;
}

// Storage Types
export interface ProspectiveEventsStorage {
  events: ProspectiveEvent[];
  version: string;
  lastModified: number;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface ValidationError {
  field: keyof ProspectiveEvent;
  message: string;
  value?: any;
}

// Error Types
export class ProspectiveEventsError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly event?: ProspectiveEvent
  ) {
    super(message);
    this.name = 'ProspectiveEventsError';
  }
}

export class CSVParseError extends ProspectiveEventsError {
  constructor(message: string, public readonly row?: number, public readonly column?: string) {
    super(message, 'CSV_PARSE_ERROR');
    this.name = 'CSVParseError';
  }
}

export class ValidationError extends ProspectiveEventsError {
  constructor(message: string, public readonly field?: keyof ProspectiveEvent) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class GeocodingError extends ProspectiveEventsError {
  constructor(message: string, event: ProspectiveEvent) {
    super(message, 'GEOCODING_ERROR', event);
    this.name = 'GeocodingError';
  }
}

export class AllocationError extends ProspectiveEventsError {
  constructor(message: string, event: ProspectiveEvent) {
    super(message, 'ALLOCATION_ERROR', event);
    this.name = 'AllocationError';
  }
}

// Contract Types for Function Signatures
export type ProspectMatcher = (events: ProspectiveEvent[], existingEAs: string[]) => Promise<AmbassadorMatchResult>;

export type ProspectAllocator = (prospectId: string, ambassadorId: string) => Promise<AllocationResult>;

export type ProspectGeocoder = (events: ProspectiveEvent[]) => Promise<GeocodeResult>;

export type ProspectValidator = (event: ProspectiveEvent) => ValidationResult;