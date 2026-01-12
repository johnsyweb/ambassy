/**
 * Populate the Prospects table with prospective events data
 */

import { ProspectiveEventList } from '../models/ProspectiveEventList';
import { EventAmbassadorMap } from '../models/EventAmbassadorMap';
import { RegionalAmbassadorMap } from '../models/RegionalAmbassadorMap';
import { showReallocationDialog } from './showReallocationDialog';
import { reallocateProspect } from './reallocateProspect';
import { getReallocationSuggestions } from './getReallocationSuggestions';
import { LogEntry } from '../models/LogEntry';

// Forward declaration - will be set by index.ts
let refreshUIAfterReallocation: (() => void) | null = null;

export function setProspectReallocationRefreshCallback(callback: () => void): void {
  refreshUIAfterReallocation = callback;
}

/**
 * Populate the Prospects table
 */
export function populateProspectsTable(
  prospects: ProspectiveEventList,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log?: LogEntry[]
): void {
  const tableBody = document.querySelector<HTMLTableSectionElement>('#prospectsTable tbody');
  if (!tableBody) {
    console.error('Prospects table body not found');
    return;
  }

  // Clear existing rows
  tableBody.innerHTML = '';

  const prospectEvents = prospects.getAll();

  if (prospectEvents.length === 0) {
    // Show empty state
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 13;
    emptyCell.textContent = 'No prospective events. Import a Prospects CSV file to get started.';
    emptyCell.style.textAlign = 'center';
    emptyCell.style.padding = '2em';
    emptyCell.style.fontStyle = 'italic';
    emptyCell.style.color = '#666';
    emptyRow.appendChild(emptyCell);
    tableBody.appendChild(emptyRow);
    return;
  }

  // Sort by prospect event name
  prospectEvents.sort((a, b) => a.prospectEvent.localeCompare(b.prospectEvent));

  prospectEvents.forEach((prospect) => {
    const row = createProspectRow(prospect, eventAmbassadors, regionalAmbassadors, prospects, log);
    tableBody.appendChild(row);
  });
}

/**
 * Create a table row for a prospective event
 */
function createProspectRow(
  prospect: any,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  prospects: ProspectiveEventList,
  log?: LogEntry[]
): HTMLTableRowElement {
  const row = document.createElement('tr');

  // Prospect Event
  const prospectEventCell = document.createElement('td');
  prospectEventCell.textContent = prospect.prospectEvent;
  row.appendChild(prospectEventCell);

  // Country
  const countryCell = document.createElement('td');
  countryCell.textContent = prospect.country;
  row.appendChild(countryCell);

  // State
  const stateCell = document.createElement('td');
  stateCell.textContent = prospect.state;
  row.appendChild(stateCell);

  // Prospect ED/s
  const edsCell = document.createElement('td');
  edsCell.textContent = prospect.prospectEDs || '';
  row.appendChild(edsCell);

  // Event Ambassador
  const eaCell = document.createElement('td');
  eaCell.textContent = prospect.eventAmbassador;
  row.appendChild(eaCell);

  // Date Made Contact
  const dateCell = document.createElement('td');
  if (prospect.dateMadeContact) {
    dateCell.textContent = prospect.dateMadeContact.toLocaleDateString();
  } else {
    dateCell.textContent = '';
  }
  row.appendChild(dateCell);

  // Course Found
  const courseCell = document.createElement('td');
  courseCell.textContent = prospect.courseFound ? '✅' : '❌';
  row.appendChild(courseCell);

  // Landowner Permission
  const landownerCell = document.createElement('td');
  landownerCell.textContent = prospect.landownerPermission ? '✅' : '❌';
  row.appendChild(landownerCell);

  // Funding Confirmed
  const fundingCell = document.createElement('td');
  fundingCell.textContent = prospect.fundingConfirmed ? '✅' : '❌';
  row.appendChild(fundingCell);

  // Geocoding Status
  const geocodingCell = document.createElement('td');
  geocodingCell.textContent = getStatusText(prospect.geocodingStatus);
  geocodingCell.style.textAlign = 'center';
  row.appendChild(geocodingCell);

  // Coordinates
  const coordinatesCell = document.createElement('td');
  if (prospect.coordinates) {
    const [lng, lat] = prospect.coordinates;
    coordinatesCell.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    coordinatesCell.title = `Latitude: ${lat}, Longitude: ${lng}`;
  } else {
    coordinatesCell.textContent = '';
  }
  coordinatesCell.style.fontFamily = 'monospace';
  coordinatesCell.style.fontSize = '0.9em';
  row.appendChild(coordinatesCell);

  // Ambassador Match
  const matchCell = document.createElement('td');
  matchCell.textContent = getStatusText(prospect.ambassadorMatchStatus);
  matchCell.style.textAlign = 'center';
  row.appendChild(matchCell);

  // Actions
  const actionsCell = document.createElement('td');
  actionsCell.style.textAlign = 'center';

  // Reallocate button
  const reallocateButton = document.createElement('button');
  reallocateButton.type = 'button';
  reallocateButton.title = 'Reallocate to different Event Ambassador';
  reallocateButton.textContent = '🤝 Reallocate';
  reallocateButton.style.marginRight = '0.5em';
  reallocateButton.addEventListener('click', () => {
    if (!log) {
      console.error('Cannot reallocate prospect: log not available');
      return;
    }

    // Get reallocation suggestions
    const suggestions = getReallocationSuggestions(
      prospect.eventAmbassador || '',
      eventAmbassadors,
      regionalAmbassadors,
      prospect.prospectEvent
    );

    // Show reallocation dialog
    showReallocationDialog(
      prospect.prospectEvent,
      prospect.eventAmbassador || 'Unassigned',
      suggestions,
      eventAmbassadors,
      regionalAmbassadors,
      (newAmbassador: string) => {
        // Perform the reallocation
        try {
          reallocateProspect(
            prospect.id,
            prospect.eventAmbassador || '',
            newAmbassador,
            prospects,
            eventAmbassadors,
            log,
            regionalAmbassadors
          );

          // Refresh the UI after reallocation
          if (refreshUIAfterReallocation) {
            refreshUIAfterReallocation();
          }
        } catch (error) {
          console.error('Failed to reallocate prospect:', error);
          alert(`Failed to reallocate prospect: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      },
      () => {
        // Cancel - do nothing
      }
    );
  });
  actionsCell.appendChild(reallocateButton);

  // Remove button
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.title = 'Remove this prospect';
  removeButton.textContent = '🗑️ Remove';
  removeButton.addEventListener('click', () => {
    // TODO: Implement prospect removal
    console.log('Remove prospect:', prospect.prospectEvent);
  });
  actionsCell.appendChild(removeButton);

  row.appendChild(actionsCell);

  return row;
}

/**
 * Convert status enum to display text
 */
function getStatusText(status: string): string {
  switch (status) {
    case 'pending':
      return '⏳ Pending';
    case 'success':
    case 'matched':
      return '✅ Success';
    case 'failed':
    case 'unmatched':
      return '❌ Failed';
    case 'manual':
      return '📍 Manual';
    default:
      return status;
  }
}