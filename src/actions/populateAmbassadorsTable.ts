import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";

export function populateAmbassadorsTable(
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap
): void {
  populateEventAmbassadorsTable(eventAmbassadors);
  populateRegionalAmbassadorsTable(regionalAmbassadors);
}

function populateEventAmbassadorsTable(eventAmbassadors: EventAmbassadorMap): void {
  const tableBody = document.querySelector("#eventAmbassadorsTable tbody");
  if (!tableBody) {
    console.error("Event Ambassadors Table Body not found");
    return;
  }
  tableBody.innerHTML = "";

  const sortedAmbassadors = Array.from(eventAmbassadors.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  sortedAmbassadors.forEach(([name, ambassador]) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = name;
    row.appendChild(nameCell);

    const eventsCell = document.createElement("td");
    if (ambassador.events.length === 0) {
      eventsCell.textContent = "No events assigned";
      eventsCell.style.fontStyle = "italic";
      eventsCell.style.color = "#666";
    } else {
      eventsCell.textContent = ambassador.events.join(", ");
    }
    row.appendChild(eventsCell);

    tableBody.appendChild(row);
  });
}

function populateRegionalAmbassadorsTable(regionalAmbassadors: RegionalAmbassadorMap): void {
  const tableBody = document.querySelector("#regionalAmbassadorsTable tbody");
  if (!tableBody) {
    console.error("Regional Ambassadors Table Body not found");
    return;
  }
  tableBody.innerHTML = "";

  const sortedAmbassadors = Array.from(regionalAmbassadors.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  sortedAmbassadors.forEach(([name, ambassador]) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = name;
    row.appendChild(nameCell);

    const stateCell = document.createElement("td");
    stateCell.textContent = ambassador.state;
    row.appendChild(stateCell);

    const easCell = document.createElement("td");
    if (ambassador.supportsEAs.length === 0) {
      easCell.textContent = "No Event Ambassadors assigned";
      easCell.style.fontStyle = "italic";
      easCell.style.color = "#666";
    } else {
      easCell.textContent = ambassador.supportsEAs.join(", ");
    }
    row.appendChild(easCell);

    tableBody.appendChild(row);
  });
}

