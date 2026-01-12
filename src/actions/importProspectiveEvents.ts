/**
 * Prospective Events Import Actions
 *
 * Handles the import pipeline for prospective events CSV files.
 */

import { parseProspectiveEventsCSV } from '../parsers/parseProspectiveEvents';
import { ProspectiveEvent } from '../models/ProspectiveEvent';
import { ProspectiveEventList } from '../models/ProspectiveEventList';
import { CSVParseResult } from '../types/ProspectiveEventTypes';
import { EventAmbassadorMap } from '../models/EventAmbassadorMap';
import { RegionalAmbassadorMap } from '../models/RegionalAmbassadorMap';
import { geocodeProspectiveEvent } from '../utils/geography';
import { levenshteinDistance } from '../utils/fuzzyMatch';
import { saveProspectiveEvents, loadProspectiveEvents } from './persistProspectiveEvents';

/**
 * Import prospective events from a CSV file
 */
export async function importProspectiveEvents(
  csvContent: string,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap
): Promise<{
  success: boolean;
  imported: number;
  errors: string[];
  warnings: string[];
}> {
  const result: {
    success: boolean;
    imported: number;
    errors: string[];
    warnings: string[];
  } = {
    success: false,
    imported: 0,
    errors: [],
    warnings: []
  };

  try {
    // Parse the CSV
    const parseResult: CSVParseResult = parseProspectiveEventsCSV(csvContent);

    // Add parse errors to result
    result.errors.push(...parseResult.errors.map(err => `Row ${err.row}: ${err.message}`));
    result.warnings.push(...parseResult.warnings);

    // If there are parse errors, don't proceed with import
    if (parseResult.errors.length > 0) {
      result.success = false;
      return result;
    }

    // Process each parsed event
    const processedEvents: ProspectiveEvent[] = [];
    const processingErrors: string[] = [];
    const processingWarnings: string[] = [];

    for (const event of parseResult.events) {
      try {
        const processed = await processProspectiveEvent(event, eventAmbassadors, regionalAmbassadors);
        processedEvents.push(processed.event);

        if (processed.warnings.length > 0) {
          processingWarnings.push(...processed.warnings.map(w => `Event "${event.prospectEvent}": ${w}`));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
        processingErrors.push(`Event "${event.prospectEvent}": ${errorMessage}`);
      }
    }

    // Add processing errors and warnings
    result.errors.push(...processingErrors);
    result.warnings.push(...processingWarnings);

    // If we have processed events and no critical errors, save them
    if (processedEvents.length > 0 && processingErrors.length === 0) {
      const existingEvents = loadProspectiveEvents();
      const updatedEvents = new ProspectiveEventList([
        ...existingEvents,
        ...processedEvents
      ]);

      // Update EventAmbassador prospectiveEvents arrays
      processedEvents.forEach(event => {
        if (event.eventAmbassador && event.ambassadorMatchStatus === 'matched') {
          const ea = eventAmbassadors.get(event.eventAmbassador);
          if (ea) {
            if (!ea.prospectiveEvents) {
              ea.prospectiveEvents = [];
            }
            if (!ea.prospectiveEvents.includes(event.id)) {
              ea.prospectiveEvents.push(event.id);
            }
          }
        }
      });

      saveProspectiveEvents(updatedEvents.getAll());
      result.imported = processedEvents.length;
      result.success = true;
    } else if (processingErrors.length > 0) {
      result.success = false;
    } else {
      // No events to import
      result.success = true;
      result.imported = 0;
    }

  } catch (error) {
    result.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.success = false;
  }

  return result;
}

/**
 * Process a single prospective event (geocoding and ambassador matching)
 */
async function processProspectiveEvent(
  event: ProspectiveEvent,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap
): Promise<{
  event: ProspectiveEvent;
  warnings: string[];
}> {
  const warnings: string[] = [];
  let processedEvent = { ...event };

  // Attempt geocoding
  try {
    const geocodingResult = await geocodeProspectiveEvent(event.prospectEvent, event.country, event.state);
    if (geocodingResult.success && geocodingResult.coordinates) {
      processedEvent.coordinates = geocodingResult.coordinates;
      processedEvent.geocodingStatus = 'success';
    } else {
      processedEvent.geocodingStatus = 'failed';
      warnings.push(`Geocoding failed: ${geocodingResult.error || 'Unknown error'}`);
    }
  } catch (error) {
    processedEvent.geocodingStatus = 'failed';
    warnings.push(`Geocoding error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Match ambassador
  try {
    const matchResult = matchEventAmbassador(event.eventAmbassador, eventAmbassadors);
    if (matchResult.matched) {
      processedEvent.eventAmbassador = matchResult.matchedAmbassador!;
      processedEvent.ambassadorMatchStatus = 'matched';

      // Set regional ambassador from the matched EA
      const matchedEA = eventAmbassadors.get(matchResult.matchedAmbassador!);
      if (matchedEA?.regionalAmbassador) {
        // Note: We don't store regionalAmbassador directly on ProspectiveEvent anymore
        // It's inferred from the EA relationship
      }
    } else {
      processedEvent.ambassadorMatchStatus = 'unmatched';
      if (event.eventAmbassador.trim() === '') {
        warnings.push('Event Ambassador not specified - can be assigned later');
      } else {
        warnings.push(`Ambassador not found: "${event.eventAmbassador}". Closest matches: ${matchResult.suggestions.join(', ')}`);
      }
    }
  } catch (error) {
    processedEvent.ambassadorMatchStatus = 'unmatched';
    warnings.push(`Ambassador matching error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    event: processedEvent,
    warnings
  };
}

/**
 * Match an event ambassador name against existing ambassadors
 */
function matchEventAmbassador(
  ambassadorName: string,
  eventAmbassadors: EventAmbassadorMap
): {
  matched: boolean;
  matchedAmbassador?: string;
  suggestions: string[];
} {
  const normalizedInput = ambassadorName.replace(/\s+/g, '').toLowerCase();
  const ambassadors = Array.from(eventAmbassadors.keys());

  // First try exact match (case insensitive, spaces removed)
  const exactMatch = ambassadors.find(name =>
    name.replace(/\s+/g, '').toLowerCase() === normalizedInput
  );
  if (exactMatch) {
    return {
      matched: true,
      matchedAmbassador: exactMatch,
      suggestions: []
    };
  }

  // Try fuzzy matching
  const fuzzyResults = ambassadors.map(name => ({
    name,
    score: 1 - (levenshteinDistance(normalizedInput, name.replace(/\s+/g, '').toLowerCase()) / Math.max(normalizedInput.length, name.length))
  })).filter(result => result.score > 0.6) // Minimum similarity threshold
    .sort((a, b) => b.score - a.score);

  if (fuzzyResults.length > 0) {
    return {
      matched: true,
      matchedAmbassador: fuzzyResults[0].name,
      suggestions: fuzzyResults.slice(1, 4).map(r => r.name) // Top 3 additional suggestions
    };
  }

  // No match found, provide suggestions
  const suggestions = ambassadors.slice(0, 5); // First 5 as suggestions
  return {
    matched: false,
    suggestions
  };
}