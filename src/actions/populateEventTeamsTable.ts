import { EventDetailsMap } from '@models/EventDetailsMap';
import { EventTeamsTableDataMap, EventTeamsTableData } from '@models/EventTeamsTableData';
import { LogEntry } from '@models/LogEntry';
import { updateEventAmbassador } from '@actions/updateEventAmbassador';
import { persistChangesLog } from './persistState';
import { countries } from '@models/country';
import { refreshUI } from './refreshUI';
import { EventAmbassadorMap } from '@models/EventAmbassadorMap';
import { RegionalAmbassadorMap } from '@models/RegionalAmbassadorMap';
import { assignEventToAmbassador } from './assignEventToAmbassador';
import { loadFromStorage } from '@utils/storage';

export function populateEventTeamsTable(
  eventTeamsTableData: EventTeamsTableDataMap,
  eventDetailsMap: EventDetailsMap,
  changelog: LogEntry[],
  eventAmbassadors?: EventAmbassadorMap,
  regionalAmbassadors?: RegionalAmbassadorMap
) {
  const tableBody = document.querySelector('#eventTeamsTable tbody');
  if (!tableBody) {
    console.error('Event Teams Table Body not found');
    return;
  }
  tableBody.innerHTML = '';

  eventTeamsTableData.forEach((data) => {
    const row = document.createElement('tr');

    const regionalAmbassadorCell = document.createElement('td');
    regionalAmbassadorCell.textContent = data.regionalAmbassador;
    row.appendChild(regionalAmbassadorCell);

    const eventAmbassadorCell = document.createElement('td');
    eventAmbassadorCell.textContent = data.eventAmbassador;
    eventAmbassadorCell.addEventListener('click', () => {
      handleEventAmbassadorCellClick(eventAmbassadorCell, data, eventTeamsTableData, changelog, eventDetailsMap, eventAmbassadors, regionalAmbassadors);
    });
    row.appendChild(eventAmbassadorCell);

    const eventShortNameCell = document.createElement('td');
    if (data.eventSeries === 0) {
      createEventShortNameDropdown(
        eventShortNameCell,
        data,
        eventDetailsMap,
        eventTeamsTableData,
        changelog
      );
    } else {
      eventShortNameCell.textContent = data.eventShortName;
    }
    row.appendChild(eventShortNameCell);

    const eventDirectorsCell = document.createElement('td');
    eventDirectorsCell.textContent = data.eventDirectors;
    row.appendChild(eventDirectorsCell);

    const eventCoordinatesCell = document.createElement('td');
    eventCoordinatesCell.textContent = data.eventCoordinates;
    row.appendChild(eventCoordinatesCell);

    const eventSeriesCell = document.createElement('td');
    eventSeriesCell.textContent = data.eventSeries.toString();
    row.appendChild(eventSeriesCell);

    const eventCountryCell = document.createElement('td');
    eventCountryCell.textContent = data.eventCountry;
    row.appendChild(eventCountryCell);

    tableBody.appendChild(row);
  });
}

function handleEventAmbassadorCellClick(
  eventAmbassadorCell: HTMLElement,
  data: EventTeamsTableData,
  eventTeamsTableData: EventTeamsTableDataMap,
  changelog: LogEntry[],
  eventDetailsMap: EventDetailsMap,
  eventAmbassadorsMap?: EventAmbassadorMap,
  regionalAmbassadorsMap?: RegionalAmbassadorMap
) {
  const dropdown = document.createElement('select');
  
  // Load all Event Ambassadors from storage if not provided
  const allEventAmbassadors = eventAmbassadorsMap ?? (() => {
    const stored = loadFromStorage<Array<[string, EventAmbassador]>>("eventAmbassadors");
    return stored ? new Map<string, EventAmbassador>(stored) : new Map<string, EventAmbassador>();
  })();

  // Get list of all Event Ambassador names, sorted alphabetically
  const allEANames = Array.from(allEventAmbassadors.keys()).sort((a, b) => a.localeCompare(b));

  allEANames.forEach((eaName) => {
    const option = document.createElement('option');
    option.value = eaName;
    option.textContent = eaName;
    dropdown.appendChild(option);
  });

  dropdown.value = data.eventAmbassador;

  dropdown.addEventListener('change', async (event) => {
    const newEventAmbassador = (event.target as HTMLSelectElement).value;
    const oldEventAmbassador = data.eventAmbassador;
    
    // Update the Event Teams table data
    updateEventAmbassador(eventTeamsTableData, data.eventShortName, newEventAmbassador, changelog);
    
    // Update the Event Ambassador's events array
    try {
      assignEventToAmbassador(
        data.eventShortName,
        oldEventAmbassador,
        newEventAmbassador,
        allEventAmbassadors,
        changelog,
        regionalAmbassadorsMap
      );
    } catch (error) {
      alert(`Failed to assign event: ${error instanceof Error ? error.message : "Unknown error"}`);
      // Revert dropdown to old value
      dropdown.value = oldEventAmbassador;
      return;
    }
    
    persistChangesLog(changelog);

    // Update the cell text and replace the dropdown with text
    data.eventAmbassador = newEventAmbassador;
    eventAmbassadorCell.innerHTML = '';
    eventAmbassadorCell.textContent = newEventAmbassador;
    
    // Refresh UI to show updated ambassador assignments
    const regionalAmbassadorsForRefresh = regionalAmbassadorsMap ?? (() => {
      const stored = loadFromStorage<Array<[string, RegionalAmbassador]>>("regionalAmbassadors");
      return stored ? new Map<string, RegionalAmbassador>(stored) : new Map<string, RegionalAmbassador>();
    })();
    refreshUI(eventDetailsMap, eventTeamsTableData, changelog, allEventAmbassadors, regionalAmbassadorsForRefresh);
  });

  eventAmbassadorCell.innerHTML = '';
  eventAmbassadorCell.appendChild(dropdown);
}

function createEventShortNameDropdown(
  eventShortNameCell: HTMLElement,
  data: EventTeamsTableData,
  eventDetailsMap: EventDetailsMap,
  eventTeamsTableData: EventTeamsTableDataMap,
  changelog: LogEntry[]
) {
  const dropdown = document.createElement('select');
  const eventShortNames = [data.eventShortName, ...Array.from(eventDetailsMap.keys()).sort()];

  eventShortNames.forEach((eventShortName) => {
    const option = document.createElement('option');
    option.value = eventShortName;
    option.textContent = eventShortName;
    dropdown.appendChild(option);
  });

  dropdown.value = data.eventShortName;

  dropdown.addEventListener('change', () => {
    const newEventShortName = dropdown.value;
    data.eventShortName = newEventShortName;

    const eventDetails = eventDetailsMap.get(newEventShortName);
    if (eventDetails) {
      data.eventSeries = eventDetails.properties.seriesid;
      data.eventCoordinates = `${eventDetails.geometry.coordinates[1]}, ${eventDetails.geometry.coordinates[0]}`;
      data.eventCountryCode = eventDetails.properties.countrycode;
      data.eventCountry = countries[eventDetails.properties.countrycode].url?.split('.').slice(-1)[0] || '?';


      eventShortNameCell.innerHTML = '';
      eventShortNameCell.textContent = newEventShortName;

      // There's more work to do here, but I'm going to leave it for now
      refreshUI(eventDetailsMap, eventTeamsTableData, changelog);
    }
  });

  eventShortNameCell.innerHTML = '';
  eventShortNameCell.appendChild(dropdown);
}
