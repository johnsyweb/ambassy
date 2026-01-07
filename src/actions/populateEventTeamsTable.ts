import { eventAmbassadorsFrom } from '@models/EventTeamsTableData';
import { EventDetailsMap } from '@models/EventDetailsMap';
import { EventTeamsTableDataMap, EventTeamsTableData } from '@models/EventTeamsTableData';
import { LogEntry } from '@models/LogEntry';
import { updateEventAmbassador } from '@actions/updateEventAmbassador';
import { persistChangesLog } from './persistState';
import { countries } from '@models/country';
import { refreshUI } from './refreshUI';

export function populateEventTeamsTable(
  eventTeamsTableData: EventTeamsTableDataMap,
  eventDetailsMap: EventDetailsMap,
  changelog: LogEntry[]
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
      handleEventAmbassadorCellClick(eventAmbassadorCell, data, eventTeamsTableData, changelog);
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
  changelog: LogEntry[]
) {
  const dropdown = document.createElement('select');
  const eventAmbassadors = eventAmbassadorsFrom(eventTeamsTableData);

  eventAmbassadors.forEach((eaName) => {
    const option = document.createElement('option');
    option.value = eaName;
    option.textContent = eaName;
    dropdown.appendChild(option);
  });

  dropdown.value = data.eventAmbassador;

  dropdown.addEventListener('change', (event) => {
    const newEventAmbassador = (event.target as HTMLSelectElement).value;
    updateEventAmbassador(eventTeamsTableData, data.eventShortName, newEventAmbassador, changelog);
    persistChangesLog(changelog);

    // Update the cell text and replace the dropdown with text
    data.eventAmbassador = newEventAmbassador;
    eventAmbassadorCell.innerHTML = '';
    eventAmbassadorCell.textContent = newEventAmbassador;
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
