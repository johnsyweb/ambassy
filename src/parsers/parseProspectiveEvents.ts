/**
 * Prospective Events CSV Parser
 *
 * Parses CSV data containing prospective events with mixed data types
 * and comprehensive validation.
 */

import { ProspectiveEvent } from '../models/ProspectiveEvent';
import { CSVParseResult, CSVParseError } from '../types/ProspectiveEventTypes';
import { validateCSVHeaders, validateProspectiveEvent } from '../utils/prospectValidation';

/**
 * Parse prospective events from CSV content
 */
export function parseProspectiveEventsCSV(content: string): CSVParseResult {
  const errors: CSVParseError[] = [];
  const events: ProspectiveEvent[] = [];

  try {
    // Parse the entire CSV content, handling multiline fields
    const rows = parseCSVRows(content);

    if (rows.length < 2) {
      errors.push({
        row: 0,
        message: 'CSV must contain at least a header row and one data row'
      });
      return { events, errors, warnings: [] };
    }

    // Parse header row
    const headers = rows[0];

    // Validate headers
    const headerValidation = validateCSVHeaders(headers);
    if (!headerValidation.isValid) {
      headerValidation.errors.forEach(error => {
        errors.push({
          row: 0,
          message: `Header validation error: ${error}`
        });
      });
      return { events, errors, warnings: [] };
    }

    // Create column index mapping
    const columnIndex: Record<string, number> = {};
    headers.forEach((header, index) => {
      columnIndex[header] = index;
    });

    // Parse data rows
    const warnings: string[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1; // 1-indexed for user display

      try {
        const event = parseProspectiveEventRow(row, columnIndex, rowNumber);
        if (event) {
          events.push(event);
        }
      } catch (error) {
        errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { events, errors, warnings };

  } catch (error) {
    errors.push({
      row: 0,
      message: `CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
    return { events, errors, warnings: [] };
  }
}

/**
 * Parse CSV content into rows, handling multiline fields properly
 */
function parseCSVRows(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];

    if (char === '"') {
      if (inQuotes && i + 1 < content.length && content[i + 1] === '"') {
        // Escaped quote within quoted field
        currentField += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
      // Empty else block is intentional - quote toggling handled above
    } else if (char === ',' && !inQuotes) {
      // Field separator
      currentRow.push(currentField.trim());
      currentField = '';
      i++;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of row (handle both \n and \r\n)
      if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(field => field.length > 0)) { // Skip empty rows
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      }
      // Skip \r if followed by \n
      if (char === '\r' && i + 1 < content.length && content[i + 1] === '\n') {
        i++;
      }
      i++;
    } else {
      currentField += char;
      i++;
    }
  }

  // Handle the last field and row
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(field => field.length > 0)) { // Skip empty rows
      rows.push(currentRow);
    }
  }

  return rows;
}


/**
 * Parse a single prospective event row
 */
function parseProspectiveEventRow(
  fields: string[],
  columnIndex: Record<string, number>,
  rowNumber: number
): ProspectiveEvent | null {

  // Validate field count matches headers
  const expectedFields = Object.keys(columnIndex).length;
  if (fields.length !== expectedFields) {
    throw new Error(`Expected ${expectedFields} fields but got ${fields.length}`);
  }

  // Helper function to get field value
  const getField = (columnName: string): string => {
    const index = columnIndex[columnName];
    if (index === undefined) {
      throw new Error(`Required column '${columnName}' not found`);
    }
    return fields[index] || '';
  };

  // Parse individual fields with validation
  const prospectEvent = getField('Prospect Event').trim();
  if (!prospectEvent) {
    throw new Error('Prospect Event name is required');
  }

  const country = getField('Country').trim();
  if (!country) {
    throw new Error('Country is required');
  }

  const state = getField('State').trim();
  const prospectEDs = getField('Prospect ED/s').trim();
  const eventAmbassador = getField('EA').trim();
  // Note: EA field can be empty - it will be marked as unmatched during import

  // Parse date
  const dateMadeContact = parseDate(getField('Date Made Contact'), rowNumber);

  // Parse boolean fields
  const courseFound = parseBoolean(getField('Course Found'), 'Course Found', rowNumber);
  const landownerPermission = parseBoolean(getField('Landowner Permission'), 'Landowner Permission', rowNumber);
  const fundingConfirmed = parseBoolean(getField('Funding Confirmed'), 'Funding Confirmed', rowNumber);

  // Create the prospective event
  const event: ProspectiveEvent = {
    id: generateProspectiveEventId(prospectEvent, country, state),
    prospectEvent,
    country,
    state,
    prospectEDs,
    eventAmbassador,
    dateMadeContact,
    courseFound,
    landownerPermission,
    fundingConfirmed,
    geocodingStatus: 'pending',
    ambassadorMatchStatus: 'pending',
    importTimestamp: Date.now(),
    sourceRow: rowNumber
  };

  // Validate the complete event
  const validation = validateProspectiveEvent(event);
  if (!validation.isValid) {
    // Throw the first validation error
    const firstError = validation.errors[0];
    throw new Error(`Validation error for ${firstError.field}: ${firstError.message}`);
  }

  return event;
}

/**
 * Parse a date string
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseDate(dateStr: string, _rowNumber: number): Date | null {
  const trimmed = dateStr.trim();
  if (!trimmed) {
    return null;
  }

  let date: Date | null = null;

  // Try DD/MM/YY format first
  const ddmmyyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (ddmmyyMatch) {
    const [, day, month, year] = ddmmyyMatch;
    const fullYear = year.length === 2 ? (parseInt(year) >= 50 ? 1900 : 2000) + parseInt(year) : parseInt(year);
    date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
  } else {
    // Try to parse as ISO format or other formats
    date = new Date(trimmed);
  }

  // Check if the date is valid
  if (!date || isNaN(date.getTime())) {
    throw new Error(`Invalid date format: '${trimmed}'`);
  }

  // Check for reasonable date range (not too far in past/future)
  const now = new Date();
  const minDate = new Date('2000-01-01');
  const maxDate = new Date(now.getFullYear() + 10, 11, 31); // 10 years in future

  if (date < minDate || date > maxDate) {
    throw new Error(`Date out of reasonable range: '${trimmed}'`);
  }

  return date;
}

/**
 * Parse a boolean value from string
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseBoolean(value: string, _fieldName: string, _rowNumber: number): boolean {
  const trimmed = value.trim().toLowerCase();

  // Accept various boolean representations for true
  if (['true', 'yes', '1', 'y', 't'].includes(trimmed)) {
    return true;
  }

  // Accept various boolean representations for false, or treat anything else as false
  if (['false', 'no', '0', 'n', 'f'].includes(trimmed)) {
    return false;
  }

  // For any other value (like "Pending", empty strings, etc.), return false
  return false;
}

/**
 * Generate a unique ID for a prospective event
 */
function generateProspectiveEventId(prospectEvent: string, country: string, state: string): string {
  const base = `${prospectEvent}-${country}-${state}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${timestamp}-${random}`;
}