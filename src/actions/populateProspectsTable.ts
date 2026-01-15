/**
 * Populate the Prospects table with prospective events data
 */

import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { showReallocationDialog } from "./showReallocationDialog";
import { reallocateProspect } from "./reallocateProspect";
import { loadCapacityLimits, calculateAllCapacityStatuses } from "./checkCapacity";
import { LogEntry } from "@models/LogEntry";
import { CapacityStatus } from "@models/CapacityStatus";
import { ReallocationSuggestion } from "@models/ReallocationSuggestion";
import { geocodeAddress } from "@utils/geography";
import { saveProspectiveEvents } from "./persistProspectiveEvents";
import { formatCoordinate, Coordinate, createCoordinate } from "@models/Coordinate";
import { persistEventAmbassadors, persistChangesLog } from "./persistState";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { calculateDistance } from "@utils/geography";
import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { EventAmbassador } from "@models/EventAmbassador";
import { initializeTableSorting } from './tableSorting';

type AmbassadorWithCounts = {
  name: string;
  ambassador: EventAmbassador;
  liveCount: number;
  prospectCount: number;
  totalCount: number;
};

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
  log?: LogEntry[],
  eventDetails?: EventDetailsMap
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
    const row = createProspectRow(prospect, eventAmbassadors, regionalAmbassadors, prospects, log, eventDetails);
    tableBody.appendChild(row);
  });

  // Initialize sorting with default: Prospect Event (column 0) ascending
  // Only initialize if we have prospects (not empty state)
  if (prospectEvents.length > 0) {
    initializeTableSorting('prospectsTable', 0, 'asc');
  }
}

/**
 * Create a table row for a prospective event
 */
function createProspectRow(
  prospect: ProspectiveEvent,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  prospects: ProspectiveEventList,
  log?: LogEntry[],
  eventDetails?: EventDetailsMap
): HTMLTableRowElement {
  const row = document.createElement('tr');
  row.setAttribute('data-prospect-id', prospect.id);

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
    coordinatesCell.textContent = formatCoordinate(prospect.coordinates);
    coordinatesCell.title = formatCoordinate(prospect.coordinates);
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

  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.flexWrap = 'wrap';
  buttonContainer.style.gap = '0.25em';
  buttonContainer.style.justifyContent = 'center';

  // Reallocate button
  const reallocateButton = document.createElement('button');
  reallocateButton.type = 'button';
  reallocateButton.title = 'Reallocate to different Event Ambassador';
  reallocateButton.textContent = '🤝 Reallocate';
  reallocateButton.addEventListener('click', () => {
    if (!log) {
      console.error('Cannot reallocate prospect: log not available');
      return;
    }

    // Get reallocation suggestions based on EA capacity
    const suggestions = generateProspectReallocationSuggestions(
      prospect.eventAmbassador || '',
      prospect,
      eventAmbassadors,
      eventDetails,
      prospects
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
      },
      eventDetails,
      prospects
    );
  });
  buttonContainer.appendChild(reallocateButton);

  // Reset Location button
  const resetLocationButton = document.createElement('button');
  resetLocationButton.type = 'button';
  resetLocationButton.title = 'Reset prospect location';
  resetLocationButton.textContent = '📍 Reset Location';
  resetLocationButton.addEventListener('click', () => {
    showProspectLocationDialog(prospect, prospects);
  });
  buttonContainer.appendChild(resetLocationButton);

  // Remove button
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.title = 'Remove this prospect';
  removeButton.textContent = '🗑️ Remove';
  removeButton.setAttribute('aria-label', `Remove prospect ${prospect.prospectEvent}`);
  removeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to remove prospect "${prospect.prospectEvent}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Remove prospect from list
      prospects.remove(prospect.id);

      // Remove from EA's prospectiveEvents array if assigned
      if (prospect.eventAmbassador) {
        const ea = eventAmbassadors.get(prospect.eventAmbassador);
        if (ea?.prospectiveEvents) {
          ea.prospectiveEvents = ea.prospectiveEvents.filter(id => id !== prospect.id);
        }
      }

      // Recalculate capacity statuses
      const capacityLimits = loadCapacityLimits();
      calculateAllCapacityStatuses(eventAmbassadors, regionalAmbassadors, capacityLimits);

      // Save the updated prospects and event ambassadors
      saveProspectiveEvents(prospects.getAll());
      persistEventAmbassadors(eventAmbassadors);

      // Log the change if log is available
      if (log) {
        const changeEntry: LogEntry = {
          timestamp: Date.now(),
          type: 'Prospect Removed',
          event: `Prospect "${prospect.prospectEvent}" (${prospect.country}, ${prospect.state}) removed`,
          oldValue: prospect.eventAmbassador || 'Unassigned',
          newValue: 'Removed'
        };
        log.unshift(changeEntry);
        persistChangesLog(log);
      }

      // Refresh the UI
      if (refreshUIAfterReallocation) {
        refreshUIAfterReallocation();
      }
    } catch (error) {
      console.error('Failed to remove prospect:', error);
      alert(`Failed to remove prospect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  buttonContainer.appendChild(removeButton);

  actionsCell.appendChild(buttonContainer);

  row.appendChild(actionsCell);

  // Add click handler for map navigation (only if prospect has coordinates)
  if (_prospectRowClickHandler && prospect.coordinates && prospect.geocodingStatus === 'success') {
    row.addEventListener('click', () => {
      _prospectRowClickHandler!(prospect.id);
    });
    row.style.cursor = 'pointer';
    row.title = 'Click to view on map';
  }

  return row;
}

/**
 * Generate reallocation suggestions for prospects
 */
function generateProspectReallocationSuggestions(
  currentAmbassador: string,
  prospect: ProspectiveEvent,
  eventAmbassadors: EventAmbassadorMap,
  eventDetails?: EventDetailsMap,
  prospects?: ProspectiveEventList
): ReallocationSuggestion[] {
  const suggestions: ReallocationSuggestion[] = [];

  // Get prospect coordinates for distance calculation
  const prospectCoords = prospect.coordinates && prospect.geocodingStatus === 'success'
    ? { lat: prospect.coordinates.latitude, lon: prospect.coordinates.longitude }
    : null;

  // Calculate current allocation counts including prospective events
  const ambassadorsWithCounts: AmbassadorWithCounts[] = Array.from(eventAmbassadors.entries()).map(([name, ambassador]) => {
    const liveCount = ambassador.events.length;
    const prospectCount = ambassador.prospectiveEvents?.length ?? 0;
    const totalCount = liveCount + prospectCount;
    return { name, ambassador, liveCount, prospectCount, totalCount };
  });

  // Sort by available capacity (ascending - those with least allocation first)
  ambassadorsWithCounts.sort((a: AmbassadorWithCounts, b: AmbassadorWithCounts) => a.totalCount - b.totalCount);

  // Generate suggestions
  for (const item of ambassadorsWithCounts) {
    const { name, ambassador, liveCount, prospectCount, totalCount } = item;
    if (name === currentAmbassador) continue; // Skip current ambassador

    const capacityStatus = ambassador.capacityStatus || CapacityStatus.WITHIN;
    
    // Primary ordering: total allocation count (fewer = higher priority, 0 = highest)
    const baseScore = Math.max(0, 1000 - (totalCount * 10));
    
    // Calculate distance to nearest event (live or prospect) as tiebreaker
    let distanceBonus = 0;
    let neighboringEvents: Array<{ name: string; distanceKm: number }> = [];
    
    if (prospectCoords && (ambassador.events.length > 0 || (ambassador.prospectiveEvents && ambassador.prospectiveEvents.length > 0))) {
      const allEvents: Array<{ name: string; lat: number; lon: number }> = [];
      
      // Add live events
      if (eventDetails) {
        for (const eventName of ambassador.events) {
          const eventDetail = eventDetails.get(eventName);
          if (eventDetail?.geometry?.coordinates) {
            const [lon, lat] = eventDetail.geometry.coordinates;
            allEvents.push({ name: eventName, lat, lon });
          }
        }
      }
      
      // Add prospect events
      if (prospects && ambassador.prospectiveEvents) {
        for (const prospectId of ambassador.prospectiveEvents) {
          const prospectEvent = prospects.findById(prospectId);
          if (prospectEvent?.coordinates && prospectEvent.geocodingStatus === 'success') {
            allEvents.push({
              name: prospectEvent.prospectEvent,
              lat: prospectEvent.coordinates.latitude,
              lon: prospectEvent.coordinates.longitude
            });
          }
        }
      }
      
      // Find nearest event (live or prospect)
      if (allEvents.length > 0) {
        let nearestDistance = Infinity;
        let nearestEvent: { name: string; distanceKm: number } | null = null;
        
        for (const event of allEvents) {
          const distance = calculateDistance(prospectCoords.lat, prospectCoords.lon, event.lat, event.lon);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestEvent = { name: event.name, distanceKm: distance };
          }
        }
        
        if (nearestEvent && nearestDistance <= 50) {
          neighboringEvents = [nearestEvent];
          // Distance bonus: closer = higher bonus (inverse relationship)
          distanceBonus = Math.max(0, 100 - nearestDistance);
        }
      }
    }
    
    const score = baseScore + distanceBonus;
    
    const reasons: string[] = [`Currently has ${totalCount} total allocations`];
    
    // Adjust reasons based on capacity status
    if (capacityStatus === CapacityStatus.UNDER) {
      reasons.push('Has available capacity');
    } else if (capacityStatus === CapacityStatus.OVER) {
      reasons.push('Currently over capacity');
    } else {
      reasons.push('Within capacity limits');
    }
    
    if (neighboringEvents.length > 0) {
      const eventList = neighboringEvents.map(e => `${e.name} (${e.distanceKm.toFixed(1)}km)`).join(', ');
      reasons.push(`Nearby events: ${eventList}`);
    }

    suggestions.push({
      fromAmbassador: currentAmbassador,
      toAmbassador: name,
      items: [prospect.prospectEvent],
      score: Math.max(0, score),
      reasons: reasons.length > 0 ? reasons : undefined,
      allocationCount: totalCount,
      liveEventsCount: liveCount,
      prospectEventsCount: prospectCount,
      neighboringEvents: neighboringEvents.length > 0 ? neighboringEvents : undefined
    });
  }

  // Sort by score (highest first)
  return suggestions.sort((a, b) => b.score - a.score);
}

function showProspectLocationDialog(prospect: ProspectiveEvent, prospects: ProspectiveEventList): void {
  const dialog = document.createElement('div');
  dialog.style.position = 'fixed';
  dialog.style.top = '0';
  dialog.style.left = '0';
  dialog.style.width = '100%';
  dialog.style.height = '100%';
  dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  dialog.style.display = 'flex';
  dialog.style.alignItems = 'center';
  dialog.style.justifyContent = 'center';
  dialog.style.zIndex = '1000';

  const dialogContent = document.createElement('div');
  dialogContent.style.backgroundColor = 'white';
  dialogContent.style.padding = '2em';
  dialogContent.style.borderRadius = '8px';
  dialogContent.style.maxWidth = '500px';
  dialogContent.style.width = '90%';
  dialogContent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

  const title = document.createElement('h2');
  title.textContent = `Reset Location for ${prospect.prospectEvent}`;
  title.style.marginTop = '0';
  dialogContent.appendChild(title);

  const currentLocation = document.createElement('p');
  currentLocation.textContent = prospect.coordinates
    ? `Current coordinates: ${formatCoordinate(prospect.coordinates)}`
    : 'No coordinates set';
  currentLocation.style.fontSize = '0.9em';
  currentLocation.style.color = '#666';
  dialogContent.appendChild(currentLocation);

  const instructions = document.createElement('p');
  instructions.textContent = 'Choose how to set the new location:';
  dialogContent.appendChild(instructions);

  // Address input option
  const addressContainer = document.createElement('div');
  addressContainer.style.marginBottom = '1em';

  const addressLabel = document.createElement('label');
  addressLabel.textContent = 'Enter Address:';
  addressLabel.style.display = 'block';
  addressLabel.style.marginBottom = '0.5em';
  addressLabel.style.fontWeight = 'bold';
  addressContainer.appendChild(addressLabel);

  const addressInput = document.createElement('input');
  addressInput.type = 'text';
  addressInput.placeholder = 'e.g., 123 Main St, Melbourne, VIC, Australia';
  addressInput.style.width = '100%';
  addressInput.style.padding = '0.5em';
  addressInput.style.border = '1px solid #ccc';
  addressInput.style.borderRadius = '4px';
  addressContainer.appendChild(addressInput);

  const geocodeButton = document.createElement('button');
  geocodeButton.textContent = 'Geocode Address';
  geocodeButton.style.marginTop = '0.5em';
  geocodeButton.style.padding = '0.5em 1em';
  geocodeButton.style.backgroundColor = '#007bff';
  geocodeButton.style.color = 'white';
  geocodeButton.style.border = 'none';
  geocodeButton.style.borderRadius = '4px';
  geocodeButton.style.cursor = 'pointer';
  addressContainer.appendChild(geocodeButton);

  dialogContent.appendChild(addressContainer);

  // Geolocation option
  const geolocationContainer = document.createElement('div');
  geolocationContainer.style.marginBottom = '1em';

  const geolocationButton = document.createElement('button');
  geolocationButton.textContent = '📍 Use Current Location';
  geolocationButton.style.padding = '0.5em 1em';
  geolocationButton.style.backgroundColor = '#28a745';
  geolocationButton.style.color = 'white';
  geolocationButton.style.border = 'none';
  geolocationButton.style.borderRadius = '4px';
  geolocationButton.style.cursor = 'pointer';
  geolocationButton.title = 'Use browser geolocation to set coordinates';
  geolocationContainer.appendChild(geolocationButton);

  dialogContent.appendChild(geolocationContainer);

  // Buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '1em';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.marginTop = '1em';

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.padding = '0.5em 1em';
  cancelButton.style.backgroundColor = '#6c757d';
  cancelButton.style.color = 'white';
  cancelButton.style.border = 'none';
  cancelButton.style.borderRadius = '4px';
  cancelButton.style.cursor = 'pointer';
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(dialog);
  });
  buttonContainer.appendChild(cancelButton);

  dialogContent.appendChild(buttonContainer);
  dialog.appendChild(dialogContent);
  document.body.appendChild(dialog);

  // Event handlers
  geocodeButton.addEventListener('click', async () => {
    const address = addressInput.value.trim();
    if (!address) {
      alert('Please enter an address');
      return;
    }

    geocodeButton.disabled = true;
    geocodeButton.textContent = 'Geocoding...';

    try {
      const result = await geocodeAddress(address);
      if (result.success && result.coordinates) {
        updateProspectLocation(prospect, prospects, result.coordinates, `Geocoded from address: ${address}`);
        document.body.removeChild(dialog);
      } else {
        alert(`Geocoding failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Geocoding error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      geocodeButton.disabled = false;
      geocodeButton.textContent = 'Geocode Address';
    }
  });

  geolocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    geolocationButton.disabled = true;
    geolocationButton.textContent = 'Getting Location...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = createCoordinate(position.coords.latitude, position.coords.longitude);
        updateProspectLocation(prospect, prospects, coordinates, 'Set from browser geolocation');
        document.body.removeChild(dialog);
      },
      (error) => {
        let errorMessage = 'Unknown geolocation error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        alert(`Geolocation failed: ${errorMessage}`);
        geolocationButton.disabled = false;
        geolocationButton.textContent = '📍 Use Current Location';
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

function updateProspectLocation(
  prospect: ProspectiveEvent,
  prospects: ProspectiveEventList,
  coordinates: Coordinate,
  source: string
): void {
  prospects.update({
    ...prospect,
    coordinates,
    geocodingStatus: 'manual'
  });

  saveProspectiveEvents(prospects.getAll());

  // Refresh the prospects table
  if (refreshUIAfterReallocation) {
    refreshUIAfterReallocation();
  }

  alert(`Location updated for "${prospect.prospectEvent}" using ${source}`);
}

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

// Global row click handler for prospects
let _prospectRowClickHandler: ((prospectId: string) => void) | null = null;

export function setProspectRowClickHandler(handler: (prospectId: string) => void): void {
  _prospectRowClickHandler = handler;
}