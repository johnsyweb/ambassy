import { EventTeamsTableDataMap } from "../models/EventTeamsTable";

export function populateEventTeamsTable(
  eventTeamsTableData: EventTeamsTableDataMap
): void {
  const tableBody = document
    .getElementById("eventTeamsTable")
    ?.getElementsByTagName("tbody")[0];
    
  if (!tableBody) {
    console.error("Table body not found");
    return;
  }

  tableBody.innerHTML = "";

  eventTeamsTableData.forEach((data, eventName) => {
    const row = tableBody.insertRow();
    const raNameCell = row.insertCell(0);
    const eaNameCell = row.insertCell(1);
    const eventNameCell = row.insertCell(2);
    const eventDirectorsCell = row.insertCell(3);
    const eventCoordinatesCell = row.insertCell(4);
    const eventSeriesCell = row.insertCell(5);
    const eventCountryCell = row.insertCell(6);

    if (
      [
        raNameCell,
        eaNameCell,
        eventNameCell,
        eventDirectorsCell,
        eventCoordinatesCell,
        eventSeriesCell,
        eventCountryCell,
      ].some((cell) => !cell)
    ) {
      console.error("Failed to insert row");
      return;
    }

    raNameCell.textContent = data.regionalAmbassador;
    eaNameCell.textContent = data.eventAmbassador;
    eventNameCell.textContent = eventName;
    eventDirectorsCell.textContent = data.eventDirectors;
    eventCoordinatesCell.textContent = data.eventCoordinates;
    eventSeriesCell.textContent = data.eventSeries.toLocaleString();
    eventCountryCell.textContent = data.eventCountry.toLocaleString();
  });
}
