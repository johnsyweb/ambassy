import { eventAmbassadorsFrom, EventTeamsTableDataMap } from '@models/EventTeamsTableData';
import { EventDetailsMap } from '@models/EventDetailsMap';
import { countries } from '@models/country';
import { updateEventAmbassador } from './updateEventAmbassador';
import { LogEntry } from '@models/LogEntry';
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
      const dropdown = document.createElement('select');
      eventAmbassadorsFrom(eventTeamsTableData)
        .forEach((eaName) => {
        const option = document.createElement('option');
        option.value = eaName;
        option.textContent = eaName;
        dropdown.appendChild(option);
      });
      dropdown.value = data.eventAmbassador;
      dropdown.addEventListener('change', (event) => {
        const newEventAmbassador = (event.target as HTMLSelectElement).value;
        updateEventAmbassador(
          eventTeamsTableData,
          data.eventShortName,
           newEventAmbassador,
           changelog
          );
      });
      eventAmbassadorCell.innerHTML = '';
      eventAmbassadorCell.appendChild(dropdown);
    });
    row.appendChild(eventAmbassadorCell);

    const eventShortNameCell = document.createElement('td');
    if (data.eventSeries) {
      eventShortNameCell.textContent = data.eventShortName;
        } else {
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
          data.eventCountry = countries[data.eventCountryCode]?.url?.split('.').slice(-1)[0] ?? 'N/A';
          refreshUI(eventDetailsMap, eventTeamsTableData, changelog);
        } 
      });
      eventShortNameCell.appendChild(dropdown);
    }
    row.appendChild(eventShortNameCell);

    const eventDirectorsCell = document.createElement('td');
    eventDirectorsCell.textContent = data.eventDirectors;
    row.appendChild(eventDirectorsCell);

    const eventCoordinatesCell = document.createElement('td');
    eventCoordinatesCell.textContent = data.eventCoordinates;
    row.appendChild(eventCoordinatesCell);

    const eventSeriesCell = document.createElement('td');
    row.appendChild(eventSeriesCell);

    const eventCountryCell = document.createElement('td');
    eventCountryCell.textContent = data.eventCountry;
    row.appendChild(eventCountryCell);
    tableBody.appendChild(row);
  });
}
