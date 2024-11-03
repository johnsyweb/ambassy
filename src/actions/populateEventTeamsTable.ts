import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";

export function populateEventTeamsTable(eventTeamsTableData: EventTeamsTableDataMap) {
  const tableBody = document.querySelector('#eventTeamsTable tbody');
  
  if (!tableBody) {
    console.error("Table body not found");
    return;
  }

  tableBody.innerHTML = '';

  eventTeamsTableData.forEach(data => {
    const row = document.createElement('tr');

    const regionalAmbassadorCell = document.createElement('td');
    regionalAmbassadorCell.textContent = data.regionalAmbassador;
    row.appendChild(regionalAmbassadorCell);

    const eventAmbassadorCell = document.createElement('td');
    eventAmbassadorCell.textContent = data.eventAmbassador;
    row.appendChild(eventAmbassadorCell);

    const eventShortNameCell = document.createElement('td');
    eventShortNameCell.textContent = data.eventShortName;
    row.appendChild(eventShortNameCell);

    const eventDirectorsCell = document.createElement('td');
    eventDirectorsCell.textContent = data.eventDirectors;
    row.appendChild(eventDirectorsCell);

    const eventCoordinatesCell = document.createElement('td');
    eventCoordinatesCell.textContent = data.eventCoordinates;
    row.appendChild(eventCoordinatesCell);

    const eventSeriesCell = document.createElement('td');
    eventSeriesCell.textContent = data.eventSeries.toLocaleString();
    row.appendChild(eventSeriesCell);

    const eventCountryCell = document.createElement('td');
    eventCountryCell.textContent = data.eventCountry;
    row.appendChild(eventCountryCell);
    
    tableBody.appendChild(row);
  });
}
