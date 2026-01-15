/**
 * Prospect Validation Utilities
 *
 * Provides validation functions for prospective event data
 * including business rules and data integrity checks.
 */

import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { ValidationResult, ValidationError } from "@localtypes/ProspectiveEventTypes";
import { isValidCoordinate, formatCoordinate } from "@models/Coordinate";

/**
 * Validate a prospective event
 */
export function validateProspectiveEvent(event: ProspectiveEvent): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Required field validations
  if (!event.prospectEvent?.trim()) {
    errors.push({
      field: 'prospectEvent',
      message: 'Prospect event name is required',
      value: event.prospectEvent
    });
  }

  if (!event.country?.trim()) {
    errors.push({
      field: 'country',
      message: 'Country is required',
      value: event.country
    });
  }

  // Note: Event ambassador can be empty and resolved later during import

  // Data type validations
  if (typeof event.courseFound !== 'boolean') {
    errors.push({
      field: 'courseFound',
      message: 'Course found must be a boolean value',
      value: event.courseFound
    });
  }

  if (typeof event.landownerPermission !== 'boolean') {
    errors.push({
      field: 'landownerPermission',
      message: 'Landowner permission must be a boolean value',
      value: event.landownerPermission
    });
  }

  if (typeof event.fundingConfirmed !== 'boolean') {
    errors.push({
      field: 'fundingConfirmed',
      message: 'Funding confirmed must be a boolean value',
      value: event.fundingConfirmed
    });
  }

  // Date validation
  if (event.dateMadeContact !== null && !(event.dateMadeContact instanceof Date)) {
    errors.push({
      field: 'dateMadeContact',
      message: 'Date made contact must be a valid date',
      value: event.dateMadeContact
    });
  }

  // Coordinates validation - delegate to Coordinate module (ONLY place for validation)
  if (event.coordinates) {
    if (!isValidCoordinate(event.coordinates)) {
      errors.push({
        field: 'coordinates',
        message: 'Invalid coordinate values',
        value: formatCoordinate(event.coordinates)
      });
    }
  }

  // Status validations
  const validGeocodingStatuses = ['pending', 'success', 'failed', 'manual'];
  if (!validGeocodingStatuses.includes(event.geocodingStatus)) {
    errors.push({
      field: 'geocodingStatus',
      message: `Geocoding status must be one of: ${validGeocodingStatuses.join(', ')}`,
      value: event.geocodingStatus
    });
  }

  const validAmbassadorMatchStatuses = ['pending', 'matched', 'unmatched'];
  if (!validAmbassadorMatchStatuses.includes(event.ambassadorMatchStatus)) {
    errors.push({
      field: 'ambassadorMatchStatus',
      message: `Ambassador match status must be one of: ${validAmbassadorMatchStatuses.join(', ')}`,
      value: event.ambassadorMatchStatus
    });
  }

  // Business rule validations
  if (event.prospectEvent && event.country && event.state) {
    // Could add uniqueness check here if needed
  }

  // Warnings for potential issues
  if (event.dateMadeContact && event.dateMadeContact > new Date()) {
    warnings.push('Date made contact is in the future');
  }

  if (event.geocodingStatus === 'failed' && !event.coordinates) {
    warnings.push('Geocoding failed and no manual coordinates provided');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate multiple prospective events
 */
export function validateProspectiveEvents(events: ProspectiveEvent[]): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: string[] = [];

  for (const event of events) {
    const result = validateProspectiveEvent(event);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Check if a prospective event can be allocated to an ambassador
 */
export function canAllocateProspect(prospect: ProspectiveEvent, ambassadorId: string): { canAllocate: boolean; reason?: string } {
  // Basic validation
  if (!prospect.eventAmbassador) {
    return { canAllocate: false, reason: 'Prospect has no assigned event ambassador' };
  }

  if (prospect.eventAmbassador === ambassadorId) {
    return { canAllocate: false, reason: 'Prospect is already assigned to this ambassador' };
  }

  return { canAllocate: true };
}

/**
 * Validate CSV data before parsing
 */
export function validateCSVHeaders(headers: string[]): { isValid: boolean; errors: string[] } {
  const requiredHeaders = [
    'Prospect Event',
    'Country',
    'State',
    'Prospect ED/s',
    'EA',
    'Date Made Contact',
    'Course Found',
    'Landowner Permission',
    'Funding Confirmed'
  ];

  const errors: string[] = [];

  // Check required headers
  for (const required of requiredHeaders) {
    if (!headers.includes(required)) {
      errors.push(`Missing required header: ${required}`);
    }
  }

  // Note: We now allow unexpected headers and ignore them rather than treating them as errors
  // This allows for CSV files with additional columns that we don't need

  return {
    isValid: errors.length === 0,
    errors
  };
}